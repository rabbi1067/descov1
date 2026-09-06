# ==============================================================================
# DESCO Smart Prepaid Meter - SQLAlchemy ORM Data Models
# Maps to MySQL (desco1) schema with multi-user & multi-meter support
# ==============================================================================

import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    Text,
    ForeignKey,
    Numeric,
)
from sqlalchemy.orm import relationship
from database import Base

# ------------------------------------------------------------------------------
# 1. User Model
# ------------------------------------------------------------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: f"usr-{uuid.uuid4().hex[:8]}")
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="user")  # 'super_admin', 'admin', 'user'
    position = Column(String(100), nullable=True)
    phone = Column(String(30), nullable=True)
    address = Column(Text, nullable=True)
    avatar = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="active")  # 'active', 'suspended'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    meters = relationship("Meter", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    alert_dispatches = relationship("AlertDispatch", back_populates="user", cascade="all, delete-orphan")

# ------------------------------------------------------------------------------
# 2. Prepaid Meter Model (Supports multiple custom thresholds per meter)
# ------------------------------------------------------------------------------
class Meter(Base):
    __tablename__ = "meters"

    id = Column(String(64), primary_key=True, default=lambda: f"mtr-{uuid.uuid4().hex[:8]}")
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    user_email = Column(String(150), nullable=False)
    name = Column(String(150), nullable=False)  # e.g., "Flat 4B", "Gulshan Office", "Factory Unit"
    meter_number = Column(String(50), unique=True, nullable=False, index=True)
    account_number = Column(String(50), nullable=False, index=True)
    current_balance = Column(Float, default=0.0)

    # Custom Multiple Thresholds in BDT (e.g. 200, 300, 100)
    low_threshold = Column(Float, default=300.0)          # Warning threshold (e.g., 200 or 300 BDT)
    critical_threshold = Column(Float, default=100.0)     # Critical threshold (e.g., 100 or 80 BDT)
    emergency_threshold = Column(Float, default=50.0)      # Imminent cutoff threshold (e.g., 50 BDT)

    # Notification Preferences
    notification_email = Column(String(150), nullable=False)
    notification_phone = Column(String(30), nullable=True)
    auto_email_alert = Column(Boolean, default=True)
    last_alert_type = Column(String(20), default="none")   # 'none', 'low', 'critical', 'emergency'
    last_alert_sent_at = Column(DateTime, nullable=True)

    # Technical & Tariff Metadata
    tariff_type = Column(String(100), default="LT-A (Residential Single Phase)")
    sanctioned_load = Column(String(50), default="3.0 kW")
    status = Column(String(20), default="healthy")         # 'healthy', 'low', 'critical'
    last_updated = Column(DateTime, default=datetime.utcnow)
    registered_date = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="meters")
    balance_history = relationship("BalanceHistory", back_populates="meter", cascade="all, delete-orphan")
    recharges = relationship("RechargeHistory", back_populates="meter", cascade="all, delete-orphan")
    alert_dispatches = relationship("AlertDispatch", back_populates="meter", cascade="all, delete-orphan")

# ------------------------------------------------------------------------------
# 3. Balance History Snapshot Model
# ------------------------------------------------------------------------------
class BalanceHistory(Base):
    __tablename__ = "balance_history"

    id = Column(String(64), primary_key=True, default=lambda: f"his-{uuid.uuid4().hex[:8]}")
    meter_id = Column(String(64), ForeignKey("meters.id"), nullable=False, index=True)
    reading_date = Column(DateTime, default=datetime.utcnow, index=True)
    balance = Column(Float, nullable=False)
    consumption = Column(Float, default=0.0)
    is_recharge = Column(Boolean, default=False)
    recharge_amount = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    meter = relationship("Meter", back_populates="balance_history")

# ------------------------------------------------------------------------------
# 4. Alert Dispatches Audit Ledger
# ------------------------------------------------------------------------------
class AlertDispatch(Base):
    __tablename__ = "alert_dispatches"

    id = Column(String(64), primary_key=True, default=lambda: f"dsp-{uuid.uuid4().hex[:8]}")
    meter_id = Column(String(64), ForeignKey("meters.id"), nullable=False, index=True)
    meter_number = Column(String(50), nullable=False)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    recipient_email = Column(String(150), nullable=False)
    alert_type = Column(String(30), nullable=False)        # 'low_balance', 'critical', 'emergency'
    balance_at_trigger = Column(Float, nullable=False)
    threshold_value = Column(Float, nullable=False)
    subject = Column(String(255), nullable=False)
    delivery_status = Column(String(20), default="sent")    # 'sent', 'failed', 'simulated'
    error_details = Column(Text, nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow, index=True)

    meter = relationship("Meter", back_populates="alert_dispatches")
    user = relationship("User", back_populates="alert_dispatches")

# ------------------------------------------------------------------------------
# 5. In-App Notification Model
# ------------------------------------------------------------------------------
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(64), primary_key=True, default=lambda: f"notif-{uuid.uuid4().hex[:8]}")
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    meter_id = Column(String(64), nullable=True)
    type = Column(String(50), nullable=False)              # 'low_balance', 'critical', 'recovery', etc.
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

# ------------------------------------------------------------------------------
# 6. Recharge Transaction Ledger Model
# ------------------------------------------------------------------------------
class RechargeHistory(Base):
    __tablename__ = "recharge_history"

    id = Column(String(64), primary_key=True, default=lambda: f"rec-{uuid.uuid4().hex[:8]}")
    meter_id = Column(String(64), ForeignKey("meters.id"), nullable=False, index=True)
    meter_number = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    transaction_id = Column(String(100), unique=True, nullable=False)
    payment_method = Column(String(50), default="bKash")
    status = Column(String(20), default="success")
    balance_after = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    meter = relationship("Meter", back_populates="recharges")

# ------------------------------------------------------------------------------
# 7. Outgoing SMTP Gateway Configuration
# ------------------------------------------------------------------------------
class SmtpConfig(Base):
    __tablename__ = "smtp_configs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    sender_name = Column(String(150), default="DESCO Smart Balance Alert")
    sender_email = Column(String(150), default="notifications@desco.org.bd")
    smtp_host = Column(String(150), default="smtp.mailgun.org")
    smtp_port = Column(Integer, default=587)
    smtp_user = Column(String(150), default="postmaster@desco.org.bd")
    smtp_password = Column(String(255), default="")
    use_tls = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ------------------------------------------------------------------------------
# 8. Security & System Audit Log Model
# ------------------------------------------------------------------------------
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, default=lambda: f"aud-{uuid.uuid4().hex[:8]}")
    actor_name = Column(String(150), nullable=False)
    actor_email = Column(String(150), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    ip_address = Column(String(50), default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

# ------------------------------------------------------------------------------
# 9. Consumer Support Ticket / Issue Report Model
# ------------------------------------------------------------------------------
class Report(Base):
    __tablename__ = "reports"

    id = Column(String(64), primary_key=True, default=lambda: f"rep-{uuid.uuid4().hex[:8]}")
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False)
    user_name = Column(String(150), nullable=False)
    user_email = Column(String(150), nullable=False)
    meter_number = Column(String(50), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(30), default="pending")         # 'pending', 'in_progress', 'resolved'
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="reports")
