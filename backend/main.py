# ==============================================================================
# DESCO Smart Prepaid Meter - Enterprise FastAPI Production Backend
# ==============================================================================
# REST API Endpoints:
# 1. Authentication (Login, Register, JWT, Password Security)
# 2. Multi-User Management (Citizen Consumer, Admin Officer, Permanent Super Admin)
# 3. Multi-Meter Management (Custom thresholds per meter, e.g. 200, 300, 100 BDT)
# 4. On-Demand Automated Grid Telemetry Scan (/api/scan-all)
# 5. Outgoing Email Alert Dispatch and Audit Ledger
# 6. Direct connectivity with MySQL database (desco1)
# ==============================================================================

import os
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt

import models
from database import engine, get_db, Base, SessionLocal
from desco_service import fetch_desco_meter_info
from email_service import send_meter_alert

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

# Security & JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-desco-key-392842940")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 Hours

# Permanent Fixed Super Admin Identifier (Non-deletable root account)
FIXED_SUPER_ADMIN_ID = "usr-super-root"
FIXED_SUPER_ADMIN_EMAIL = "fazlerabbii2000@gmail.com"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against hashed value or default password."""
    if plain_password == "123456" and (hashed_password == "123456" or "123456" in hashed_password):
        return True
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    """Generates Bcrypt hash for passwords."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Generates signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def init_root_super_admin():
    """
    Guarantees that the fixed permanent Super Admin account exists in the database.
    This account has the fixed ID 'usr-super-root' and can never be deleted or suspended.
    """
    db = SessionLocal()
    try:
        admin = db.query(models.User).filter(
            (models.User.id == FIXED_SUPER_ADMIN_ID) | (models.User.email == FIXED_SUPER_ADMIN_EMAIL)
        ).first()
        if not admin:
            root_admin = models.User(
                id=FIXED_SUPER_ADMIN_ID,
                name="Fazley Rabbi",
                email=FIXED_SUPER_ADMIN_EMAIL,
                password_hash=get_password_hash("123456"),
                role="super_admin",
                position="Chief Systems Administrator & Grid Controller",
                phone="+880 1700-000000",
                address="Dhaka, Bangladesh",
                avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                status="active"
            )
            db.add(root_admin)
            db.commit()
            print(f"[✓] Permanent Root Super Admin '{FIXED_SUPER_ADMIN_ID}' verified in database.")
        else:
            # Ensure permanent ID, name, email, role, and active status are preserved
            admin.id = FIXED_SUPER_ADMIN_ID
            admin.name = "Fazley Rabbi"
            admin.email = FIXED_SUPER_ADMIN_EMAIL
            admin.role = "super_admin"
            admin.status = "active"
            db.commit()
    except Exception as e:
        print(f"[!] Root super admin initialization note: {e}")
        db.rollback()
    finally:
        db.close()

# Initialize root super admin on module load
init_root_super_admin()

# FastAPI Application Initialization
app = FastAPI(
    title="DESCO Smart Prepaid Monitor Backend API",
    description="Production-grade API connected to MySQL database (desco1) with Multi-User & Multi-Meter threshold engine",
    version="2.0.0"
)

# CORS Policy Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# Pydantic Request & Response Schemas
# ==============================================================================
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None
    address: Optional[str] = None

class CreateAdminRequest(BaseModel):
    name: str
    email: str
    password: str
    position: str
    phone: Optional[str] = None

class UpdateUserRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None

class AddMeterRequest(BaseModel):
    userId: Optional[str] = None
    name: str
    meterNumber: str
    accountNumber: str
    notificationEmail: str
    notificationPhone: Optional[str] = None
    lowThreshold: Optional[float] = 300.0        # Warning threshold (e.g., 200 or 300 BDT)
    criticalThreshold: Optional[float] = 100.0   # Critical alert threshold (e.g., 100 BDT)
    emergencyThreshold: Optional[float] = 50.0   # Imminent cut-off limit
    autoEmailAlert: Optional[bool] = True

class UpdateMeterRequest(BaseModel):
    name: str
    meterNumber: str
    accountNumber: str
    notificationEmail: str
    notificationPhone: Optional[str] = None
    lowThreshold: float
    criticalThreshold: float
    emergencyThreshold: Optional[float] = 50.0
    autoEmailAlert: Optional[bool] = True
    tariffType: Optional[str] = None

class SmtpConfigRequest(BaseModel):
    senderName: str
    senderEmail: str
    smtpHost: str
    smtpPort: int
    smtpUser: str
    smtpPassword: str
    useTls: bool

class CreateReportRequest(BaseModel):
    meterNumber: str
    category: str
    description: str

class ResolveReportRequest(BaseModel):
    resolutionNotes: str

# ==============================================================================
# Authentication Middleware Dependency
# ==============================================================================
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Validates JWT bearer token and returns current authenticated user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authentication header")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token subject")
    except JWTError:
        raise HTTPException(status_code=401, detail="Authentication token expired or invalid")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")
    if user.status == "suspended":
        raise HTTPException(status_code=403, detail="Your account is currently suspended")
    return user

# ==============================================================================
# 1. Authentication Routes
# ==============================================================================
@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Authenticates consumer or administrator credentials."""
    user = db.query(models.User).filter(models.User.email == req.email.strip().lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password. Please verify credentials."
        )
    if user.status == "suspended":
        raise HTTPException(status_code=403, detail="Account suspended. Please contact DESCO administration.")

    token = create_access_token(data={"sub": user.id, "role": user.role})
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "position": user.position,
            "phone": user.phone,
            "address": user.address,
            "avatar": user.avatar,
            "status": user.status,
            "createdAt": user.created_at.isoformat() if user.created_at else None
        }
    }

@app.post("/api/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Registers a new citizen consumer account."""
    existing = db.query(models.User).filter(models.User.email == req.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    new_user = models.User(
        id=f"usr-{uuid.uuid4().hex[:8]}",
        name=req.name.strip(),
        email=req.email.strip().lower(),
        password_hash=get_password_hash(req.password),
        role="user",
        phone=req.phone,
        address=req.address,
        status="active"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.id, "role": new_user.role})
    return {
        "token": token,
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "phone": new_user.phone,
            "status": new_user.status
        }
    }

# ==============================================================================
# 2. Meter Management Routes (Multi-Meter & Custom Thresholds CRUD)
# ==============================================================================
@app.get("/api/meters")
def list_meters(userId: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieves all meters or meters belonging to a specific consumer."""
    query = db.query(models.Meter)
    if userId:
        query = query.filter(models.Meter.user_id == userId)
    return query.all()

@app.post("/api/meters")
async def add_meter(req: AddMeterRequest, db: Session = Depends(get_db)):
    """
    Registers a new prepaid meter.
    Allows consumer to configure custom multi-thresholds (e.g. 200 BDT or 300 BDT).
    """
    existing = db.query(models.Meter).filter(models.Meter.meter_number == req.meterNumber.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="This meter number is already registered.")

    target_user_id = req.userId or "usr-citizen-1"
    user = db.query(models.User).filter(models.User.id == target_user_id).first()
    if not user:
        user = db.query(models.User).first()
        target_user_id = user.id if user else "usr-citizen-1"

    # Fetch initial live telemetry from DESCO gateway
    telemetry = await fetch_desco_meter_info(req.accountNumber, req.meterNumber)
    current_bal = float(telemetry.get("balance", 250.0))

    low_th = req.lowThreshold if req.lowThreshold is not None else 300.0
    crit_th = req.criticalThreshold if req.criticalThreshold is not None else 100.0
    emerg_th = req.emergencyThreshold if req.emergencyThreshold is not None else 50.0

    meter_status = "critical" if current_bal <= crit_th else ("low" if current_bal <= low_th else "healthy")

    meter = models.Meter(
        id=f"mtr-{uuid.uuid4().hex[:8]}",
        user_id=target_user_id,
        user_email=req.notificationEmail.strip().lower(),
        name=req.name.strip(),
        meter_number=req.meterNumber.strip(),
        account_number=req.accountNumber.strip(),
        current_balance=current_bal,
        low_threshold=low_th,
        critical_threshold=crit_th,
        emergency_threshold=emerg_th,
        notification_email=req.notificationEmail.strip().lower(),
        notification_phone=req.notificationPhone,
        auto_email_alert=req.autoEmailAlert if req.autoEmailAlert is not None else True,
        tariff_type=telemetry.get("tariff", "LT-A (Residential Single Phase)"),
        sanctioned_load=telemetry.get("sanctionedLoad", "3.0 kW"),
        status=meter_status,
        last_updated=datetime.utcnow()
    )
    db.add(meter)
    db.commit()
    db.refresh(meter)

    # Record initial balance history snapshot
    try:
        hist = models.BalanceHistory(
            meter_id=meter.id,
            reading_date=datetime.utcnow(),
            balance=current_bal,
            consumption=0.0
        )
        db.add(hist)
        db.commit()
    except Exception:
        pass

    return meter

@app.put("/api/meters/{meter_id}")
def update_meter(meter_id: str, req: UpdateMeterRequest, db: Session = Depends(get_db)):
    """Updates meter information and configured thresholds."""
    meter = db.query(models.Meter).filter(models.Meter.id == meter_id).first()
    if not meter:
        raise HTTPException(status_code=404, detail="Meter record not found")

    meter.name = req.name.strip()
    meter.meter_number = req.meterNumber.strip()
    meter.account_number = req.accountNumber.strip()
    meter.notification_email = req.notificationEmail.strip().lower()
    meter.notification_phone = req.notificationPhone
    meter.low_threshold = req.lowThreshold
    meter.critical_threshold = req.criticalThreshold
    if req.emergencyThreshold is not None:
        meter.emergency_threshold = req.emergencyThreshold
    if req.autoEmailAlert is not None:
        meter.auto_email_alert = req.autoEmailAlert
    if req.tariffType:
        meter.tariff_type = req.tariffType

    # Recalculate status
    if meter.current_balance <= meter.critical_threshold:
        meter.status = "critical"
    elif meter.current_balance <= meter.low_threshold:
        meter.status = "low"
    else:
        meter.status = "healthy"

    db.commit()
    db.refresh(meter)
    return meter

@app.delete("/api/meters/{meter_id}")
def delete_meter(meter_id: str, db: Session = Depends(get_db)):
    """Deletes a prepaid meter and associated telemetry history."""
    meter = db.query(models.Meter).filter(models.Meter.id == meter_id).first()
    if not meter:
        raise HTTPException(status_code=404, detail="Meter not found")
    db.delete(meter)
    db.commit()
    return {"success": True, "deletedId": meter_id}

@app.post("/api/meters/{meter_id}/refresh")
async def refresh_single_meter(meter_id: str, db: Session = Depends(get_db)):
    """Refreshes live balance for a meter and evaluates thresholds."""
    meter = db.query(models.Meter).filter(models.Meter.id == meter_id).first()
    if not meter:
        raise HTTPException(status_code=404, detail="Meter not found")

    telemetry = await fetch_desco_meter_info(meter.account_number, meter.meter_number)
    new_balance = float(telemetry["balance"])
    meter.current_balance = new_balance
    meter.last_updated = datetime.utcnow()

    alert_sent = False
    # Threshold Evaluation
    if new_balance <= meter.critical_threshold:
        meter.status = "critical"
        if meter.auto_email_alert:
            alert_sent = send_meter_alert(
                db=db,
                meter=meter,
                current_balance=new_balance,
                threshold_value=meter.critical_threshold,
                urgency="critical"
            )
    elif new_balance <= meter.low_threshold:
        meter.status = "low"
        if meter.auto_email_alert:
            alert_sent = send_meter_alert(
                db=db,
                meter=meter,
                current_balance=new_balance,
                threshold_value=meter.low_threshold,
                urgency="warning"
            )
    else:
        meter.status = "healthy"
        meter.last_alert_type = "none"

    db.commit()
    db.refresh(meter)
    return {
        "meter": meter,
        "alertSent": alert_sent,
        "source": telemetry.get("source")
    }

@app.post("/api/meters/{meter_id}/test-alert")
def send_test_alert(meter_id: str, db: Session = Depends(get_db)):
    """Dispatches a test notification to verify SMTP delivery."""
    meter = db.query(models.Meter).filter(models.Meter.id == meter_id).first()
    if not meter:
        raise HTTPException(status_code=404, detail="Meter not found")

    success = send_meter_alert(
        db=db,
        meter=meter,
        current_balance=meter.current_balance,
        threshold_value=meter.low_threshold,
        urgency="warning"
    )
    return {
        "success": success,
        "recipient": meter.notification_email,
        "meterNumber": meter.meter_number,
        "message": f"Test alert email successfully processed for {meter.notification_email}."
    }

# ==============================================================================
# 3. On-Demand Batch Grid Telemetry Scan
# ==============================================================================
@app.post("/api/scan-all")
async def trigger_full_grid_scan(force: bool = False, db: Session = Depends(get_db)):
    """
    On-demand batch scanner across all registered consumers and meters.
    Fetches real-time telemetry, checks thresholds, and triggers emails.
    """
    meters = db.query(models.Meter).join(models.User).filter(models.User.status == "active").all()
    scanned = 0
    dispatched = 0
    healthy = 0

    for meter in meters:
        scanned += 1
        telemetry = await fetch_desco_meter_info(meter.account_number, meter.meter_number)
        live_bal = float(telemetry.get("balance", meter.current_balance))
        meter.current_balance = live_bal
        meter.last_updated = datetime.utcnow()

        # Balance snapshot
        hist = models.BalanceHistory(
            meter_id=meter.id,
            reading_date=datetime.utcnow(),
            balance=live_bal,
            consumption=0.0
        )
        db.add(hist)

        # Threshold checks
        if live_bal <= meter.critical_threshold:
            meter.status = "critical"
            if meter.auto_email_alert:
                send_meter_alert(db, meter, live_bal, meter.critical_threshold, "critical")
                dispatched += 1
        elif live_bal <= meter.low_threshold:
            meter.status = "low"
            if meter.auto_email_alert:
                send_meter_alert(db, meter, live_bal, meter.low_threshold, "warning")
                dispatched += 1
        else:
            meter.status = "healthy"
            meter.last_alert_type = "none"
            healthy += 1

    db.commit()

    return {
        "success": True,
        "timestamp": datetime.utcnow().isoformat(),
        "totalMetersScanned": scanned,
        "alertsDispatched": dispatched,
        "healthyMeters": healthy
    }

# ==============================================================================
# 4. Alert Dispatch Ledger & Notification Routes
# ==============================================================================
@app.get("/api/alert-dispatches")
def get_alert_dispatches(limit: int = 50, db: Session = Depends(get_db)):
    """Returns persistent audit records of all dispatched alert emails."""
    return db.query(models.AlertDispatch).order_by(models.AlertDispatch.sent_at.desc()).limit(limit).all()

@app.get("/api/notifications")
def get_notifications(userId: Optional[str] = None, db: Session = Depends(get_db)):
    """Returns in-app notifications for the dashboard."""
    query = db.query(models.Notification)
    if userId:
        query = query.filter(models.Notification.user_id == userId)
    return query.order_by(models.Notification.created_at.desc()).all()

@app.put("/api/notifications/{notif_id}/read")
def mark_notification_read(notif_id: str, db: Session = Depends(get_db)):
    notif = db.query(models.Notification).filter(models.Notification.id == notif_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"success": True}

# ==============================================================================
# 5. Outgoing SMTP Gateway Configuration Routes
# ==============================================================================
@app.get("/api/smtp-config")
def get_smtp_config(db: Session = Depends(get_db)):
    cfg = db.query(models.SmtpConfig).filter(models.SmtpConfig.is_active == True).first()
    if not cfg:
        return {
            "senderName": "DESCO Smart Alerts",
            "senderEmail": "notifications@desco.org.bd",
            "smtpHost": "smtp.mailgun.org",
            "smtpPort": 587,
            "smtpUser": "postmaster@notifications.desco.org.bd",
            "useTls": True
        }
    return {
        "senderName": cfg.sender_name,
        "senderEmail": cfg.sender_email,
        "smtpHost": cfg.smtp_host,
        "smtpPort": cfg.smtp_port,
        "smtpUser": cfg.smtp_user,
        "useTls": cfg.use_tls
    }

@app.put("/api/smtp-config")
def update_smtp_config(req: SmtpConfigRequest, db: Session = Depends(get_db)):
    cfg = db.query(models.SmtpConfig).first()
    if not cfg:
        cfg = models.SmtpConfig()
        db.add(cfg)
    cfg.sender_name = req.senderName
    cfg.sender_email = req.senderEmail
    cfg.smtp_host = req.smtpHost
    cfg.smtp_port = req.smtpPort
    cfg.smtp_user = req.smtpUser
    if req.smtpPassword:
        cfg.smtp_password = req.smtpPassword
    cfg.use_tls = req.useTls
    cfg.is_active = True
    db.commit()
    return {"success": True, "message": "SMTP configuration updated successfully."}

# ==============================================================================
# 6. User & Governance Management Routes (Protected Root Super Admin)
# ==============================================================================
@app.get("/api/users")
def get_users(db: Session = Depends(get_db)):
    """Returns list of registered users."""
    return db.query(models.User).all()

@app.put("/api/users/{user_id}")
def update_user(user_id: str, req: UpdateUserRequest, db: Session = Depends(get_db)):
    """Updates user profile details."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # If editing root super admin, ensure core credentials remain intact
    if user.id == FIXED_SUPER_ADMIN_ID:
        user.name = req.name.strip()
        user.phone = req.phone
        user.address = req.address
        user.role = "super_admin"
        user.status = "active"
    else:
        user.name = req.name.strip()
        user.email = req.email.strip().lower()
        user.phone = req.phone
        user.address = req.address

    db.commit()
    return user

@app.put("/api/users/{user_id}/status")
def toggle_user_status(user_id: str, db: Session = Depends(get_db)):
    """
    Toggles user status between active and suspended.
    Strictly protects the permanent Super Admin from being suspended.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.id == FIXED_SUPER_ADMIN_ID or user.role == "super_admin":
        raise HTTPException(
            status_code=400,
            detail="Protected Root Account: The permanent Super Admin (usr-super-root) cannot be suspended or deactivated."
        )
    
    user.status = "suspended" if user.status == "active" else "active"
    db.commit()
    return {"success": True, "status": user.status}

@app.delete("/api/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    """
    Deletes a user account.
    Strictly protects the permanent Super Admin from deletion.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")
    
    if user.id == FIXED_SUPER_ADMIN_ID or user.role == "super_admin":
        raise HTTPException(
            status_code=400,
            detail="Protected Root Account: The permanent Super Admin (usr-super-root) cannot be deleted."
        )
    
    db.delete(user)
    db.commit()
    return {"success": True, "deletedUserId": user_id}

@app.post("/api/admins")
def add_admin(req: CreateAdminRequest, db: Session = Depends(get_db)):
    """Creates an administrative staff account."""
    existing = db.query(models.User).filter(models.User.email == req.email.strip().lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    admin = models.User(
        id=f"usr-adm-{uuid.uuid4().hex[:6]}",
        name=req.name.strip(),
        email=req.email.strip().lower(),
        password_hash=get_password_hash(req.password),
        role="admin",
        position=req.position.strip(),
        phone=req.phone,
        status="active"
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin

# ==============================================================================
# 7. Support Reports & Consumer Inquiries
# ==============================================================================
@app.get("/api/reports")
def list_reports(db: Session = Depends(get_db)):
    """Lists consumer support inquiries and dispute tickets."""
    return db.query(models.Report).order_by(models.Report.created_at.desc()).all()

@app.post("/api/reports")
def create_report(req: CreateReportRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Submits a customer support inquiry."""
    report = models.Report(
        id=f"rep-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id,
        user_name=current_user.name,
        user_email=current_user.email,
        meter_number=req.meterNumber,
        category=req.category,
        description=req.description,
        status="pending"
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@app.put("/api/reports/{report_id}/resolve")
def resolve_report(report_id: str, req: ResolveReportRequest, db: Session = Depends(get_db)):
    """Resolves an open support ticket."""
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "resolved"
    report.resolution_notes = req.resolutionNotes
    report.resolved_at = datetime.utcnow()
    db.commit()
    return report

# ==============================================================================
# 8. Health & System Status Telemetry
# ==============================================================================
@app.get("/api/health")
def health(db: Session = Depends(get_db)):
    total_users = db.query(models.User).count()
    total_meters = db.query(models.Meter).count()
    total_alerts = db.query(models.AlertDispatch).count()
    return {
        "status": "online",
        "database": os.getenv("MYSQL_DATABASE", "desco1"),
        "totalUsers": total_users,
        "totalMeters": total_meters,
        "totalAlertsDispatched": total_alerts,
        "timestamp": datetime.utcnow().isoformat()
    }
