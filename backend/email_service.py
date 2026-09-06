# ==========================================================
# DESCO Smart Prepaid Meter - Enterprise Email Dispatch Service
# Generates high-fidelity HTML emails & logs to MySQL (desco1)
# ==========================================================

import os
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import logging
from sqlalchemy.orm import Session
from dotenv import load_dotenv

import models

load_dotenv()
logger = logging.getLogger("email_service")

def build_professional_email_html(
    meter_name: str,
    meter_number: str,
    account_number: str,
    customer_name: str,
    current_balance: float,
    threshold_value: float,
    urgency: str = "warning"
) -> str:
    """
    Constructs a responsive, modern, and official DESCO alert email template.
    Provides clear urgency indicators in both English and Bengali for consumer clarity.
    """
    is_critical = urgency.lower() in ["critical", "emergency"]
    primary_color = "#dc2626" if is_critical else "#d97706"
    badge_bg = "#fee2e2" if is_critical else "#fef3c7"
    badge_text = "#991b1b" if is_critical else "#92400e"
    alert_badge_title = "CRITICAL CUT-OFF WARNING / অতি জরুরি সতর্কতা" if is_critical else "LOW BALANCE NOTICE / স্বল্প ব্যালেন্স নোটিশ"
    
    current_time_str = datetime.now().strftime("%d %b %Y, %I:%M %p")

    # Estimate remaining electricity duration based on average consumption
    approx_burn_per_day = 45.0  # Estimated average daily burn rate in BDT
    days_left = max(0.1, round(current_balance / approx_burn_per_day, 1))

    return f"""<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DESCO Smart Meter Balance Notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f1f5f9; padding: 24px 0;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          
          <!-- Official DESCO Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 32px; text-align: center; border-bottom: 4px solid {primary_color};">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      ⚡ DESCO <span style="color: #38bdf8; font-weight: 500;">SMART METER</span>
                    </div>
                    <div style="font-size: 13px; color: #94a3b8; margin-top: 4px; letter-spacing: 0.5px; text-transform: uppercase;">
                      ঢাকা ইলেকট্রিক সাপ্লাই কোম্পানি লিমিটেড (ডেসকো)
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alert Status Banner -->
          <tr>
            <td style="padding: 24px 32px 12px 32px; text-align: center;">
              <span style="display: inline-block; background-color: {badge_bg}; color: {badge_text}; padding: 6px 16px; border-radius: 50px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px;">
                {alert_badge_title}
              </span>
              <h2 style="margin: 16px 0 6px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                মিটার ব্যালেন্স নির্ধারিত সীমার নিচে নেমে গেছে
              </h2>
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                প্রিয় <strong>{customer_name}</strong>, আপনার প্রিপেইড মিটার <strong>{meter_name}</strong>-এর বিদ্যুৎ বিচ্ছিন্নতা এড়াতে অনতিবিলম্বে রিচার্জ করুন।
              </p>
            </td>
          </tr>

          <!-- Balance Telemetry Highlight Box -->
          <tr>
            <td style="padding: 12px 32px 24px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                <tr>
                  <td width="50%" style="vertical-align: top; border-right: 1px solid #e2e8f0; padding-right: 16px;">
                    <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">বর্তমান ব্যালেন্স (Current Balance)</div>
                    <div style="font-size: 28px; font-weight: 800; color: {primary_color}; margin-top: 4px;">
                      ৳{current_balance:.2f} <span style="font-size: 14px; font-weight: 500; color: #64748b;">BDT</span>
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
                      সিঙ্ক সময়: {current_time_str}
                    </div>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 16px;">
                    <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">অ্যালার্ট থ্রেশহোল্ড (Configured)</div>
                    <div style="font-size: 18px; font-weight: 700; color: #334155; margin-top: 6px;">
                      ৳{threshold_value:.2f} BDT
                    </div>
                    <div style="font-size: 12px; color: {primary_color}; font-weight: 600; margin-top: 8px;">
                      ⚠️ আনুমানিক {days_left} দিনের বিদ্যুৎ বাকি আছে
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Detailed Meter Information Table -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; color: #475569; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b;">মিটার পরিচিতি (Premise)</td>
                  <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #0f172a;">{meter_name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b;">ফিজিক্যাল মিটার নম্বর (Meter No)</td>
                  <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #0f172a; font-family: monospace;">#{meter_number}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0; color: #64748b;">গ্রাহক অ্যাকাউন্ট (Account No)</td>
                  <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #0f172a; font-family: monospace;">{account_number}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #64748b;">জরুরি বিচ্ছিন্নতা স্থিতি</td>
                  <td style="padding: 10px 0; font-weight: 700; text-align: right; color: {primary_color};">
                    {"⚠️ DISCONNECTION IMMINENT" if is_critical else "⚡ RECHARGE ADVISED"}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quick Recharge Action Buttons -->
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center;">
              <div style="font-size: 13px; color: #64748b; margin-bottom: 16px;">
                বিকাশ, নগদ অথবা সরাসরি ডেসকো পোর্টাল থেকে তাৎক্ষণিক রিচার্জ করুন:
              </div>
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://prepaid.desco.org.bd" target="_blank" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 10px rgba(5, 150, 105, 0.2);">
                      ⚡ DESCO অনলাইন রিচার্জ পোর্টাল
                    </a>
                  </td>
                </tr>
              </table>
              <div style="margin-top: 14px; font-size: 12px; color: #94a3b8;">
                (bKash/Nagad অ্যাপে Pay Bill অপশনে গিয়ে বিদ্যুৎ -> DESCO Prepaid নির্বাচন করে মিটার নং <strong>{meter_number}</strong> দিন)
              </div>
            </td>
          </tr>

          <!-- Official Footer & 24/7 Helpline -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <div style="font-weight: 600; color: #475569; margin-bottom: 4px;">
                ডেসকো ২৪/৭ গ্রাহক সেবা হটলাইন: <span style="color: #0284c7; font-size: 14px; font-weight: 700;">16120</span>
              </div>
              <div>
                হেড অফিস: প্লট নং ২২/বি, ফারাজ হোসেন এভিনিউ, নিকুঞ্জ-২, খিলক্ষেত, ঢাকা-১২২৯।
              </div>
              <div style="margin-top: 10px; font-size: 11px; color: #cbd5e1;">
                এটি একটি স্বয়ংক্রিয় কম্পিউটারাইজড টেলিমেট্রি অ্যালার্ট। অনুগ্রহ করে এই ইমেইলে সরাসরি উত্তর দেবেন না।
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

def send_meter_alert(
    db: Session,
    meter: models.Meter,
    current_balance: float,
    threshold_value: float,
    urgency: str = "warning"
) -> bool:
    """
    Dispatches automated meter alert email and logs audit entries in MySQL (desco1)
    within alert_dispatches and notifications tables.
    """
    to_email = meter.notification_email
    meter_name = meter.name
    meter_number = meter.meter_number
    account_number = meter.account_number
    user_name = meter.user.name if meter.user else "Valued Citizen"
    user_id = meter.user_id

    is_critical = urgency.lower() in ["critical", "emergency"]
    subject = (
        f"🚨 URGENT: DESCO Meter #{meter_number} Balance Critical (৳{current_balance:.2f})"
        if is_critical
        else f"⚠️ DESCO Alert: Meter #{meter_number} Low Balance Warning (৳{current_balance:.2f})"
    )

    # Generate HTML content
    html_content = build_professional_email_html(
        meter_name=meter_name,
        meter_number=meter_number,
        account_number=account_number,
        customer_name=user_name,
        current_balance=current_balance,
        threshold_value=threshold_value,
        urgency=urgency
    )

    # Fetch SMTP configuration from database or environment variables
    db_config = db.query(models.SmtpConfig).filter(models.SmtpConfig.is_active == True).first()
    
    smtp_host = (db_config.smtp_host if db_config else None) or os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int((db_config.smtp_port if db_config else None) or os.getenv("SMTP_PORT", 587))
    smtp_user = (db_config.smtp_user if db_config else None) or os.getenv("SMTP_USER") or os.getenv("EMAIL_USER", "")
    smtp_password = (db_config.smtp_password if db_config else None) or os.getenv("SMTP_PASSWORD") or os.getenv("EMAIL_PASS", "")
    sender_name = (db_config.sender_name if db_config else None) or os.getenv("SMTP_FROM_NAME", "DESCO Balance Monitor")
    sender_email = (db_config.sender_email if db_config else None) or os.getenv("SMTP_FROM_EMAIL") or smtp_user or "notifications@desco.org.bd"
    use_tls = db_config.use_tls if db_config else True

    delivery_status = "sent"
    error_details = None

    # Execute email dispatch
    try:
        # Fall back to simulated dispatch if SMTP credentials are not configured
        if not smtp_user or not smtp_password or "secret" in smtp_password.lower():
            logger.info(f"[SIMULATED EMAIL] SMTP credentials demo mode. Dispatched simulated alert to {to_email} for meter #{meter_number}")
            delivery_status = "simulated"
        else:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{sender_name} <{sender_email}>"
            msg["To"] = to_email
            msg["Reply-To"] = sender_email
            msg["X-Mailer"] = "DESCO Balance Monitor"
            msg["X-Priority"] = "1" if is_critical else "3"

            # Plain text matching original script format
            now_str = datetime.now().strftime("%d %b %Y, %I:%M:%S %p")
            plain_text = f"""Hello,

⚠️ This is an automated DESCO prepaid balance alert.

DESCO Account Details
────────────────────
Account No : {account_number}
Meter No : {meter_number} ({meter_name})

Current Status
────────────────────
Current Balance : {current_balance:.2f} BDT
Alert Threshold : {threshold_value:.2f} BDT
Reading Time : {now_str}

Your DESCO prepaid meter balance has dropped below {threshold_value:.2f} BDT.
Please recharge your meter as soon as possible to avoid any unexpected power interruptions.

Regards,
DESCO Balance Monitor
Created by Md Fazley Rabbi
"""
            msg.attach(MIMEText(plain_text, "plain", "utf-8"))
            msg.attach(MIMEText(html_content, "html", "utf-8"))

            if use_tls:
                server = smtplib.SMTP(smtp_host, smtp_port, timeout=12)
                server.starttls()
            else:
                server = smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=12)

            server.login(smtp_user, smtp_password)
            server.sendmail(sender_email, [to_email], msg.as_string())
            server.quit()
            logger.info(f"[✓] Real SMTP email delivered successfully to {to_email} for meter #{meter_number}")
            delivery_status = "sent"

    except Exception as e:
        logger.error(f"[X] SMTP delivery error to {to_email}: {str(e)}")
        delivery_status = "failed"
        error_details = str(e)

    # --------------------------------------------------------------------------
    # Database persistence (desco1):
    # 1. Store dispatch record in alert_dispatches table
    # 2. Generate in-app user notification in notifications table
    # 3. Update meter telemetry last_alert_sent_at and last_alert_type
    # --------------------------------------------------------------------------
    try:
        # 1. alert_dispatches entry
        dispatch_record = models.AlertDispatch(
            id=f"dsp-{uuid.uuid4().hex[:8]}",
            meter_id=meter.id,
            meter_number=meter.meter_number,
            user_id=user_id,
            recipient_email=to_email,
            alert_type="critical" if is_critical else "low_balance",
            balance_at_trigger=current_balance,
            threshold_value=threshold_value,
            subject=subject,
            delivery_status=delivery_status,
            error_details=error_details,
            sent_at=datetime.utcnow()
        )
        db.add(dispatch_record)

        # 2. notifications entry
        notif_record = models.Notification(
            id=f"notif-{uuid.uuid4().hex[:8]}",
            user_id=user_id,
            meter_id=meter.id,
            type="critical" if is_critical else "low_balance",
            title=f"Emergency Alert: Meter #{meter.meter_number}" if is_critical else f"Low Balance Alert: Meter #{meter.meter_number}",
            message=f"Balance for '{meter.name}' dipped to ৳{current_balance:.2f} (Threshold: ৳{threshold_value:.2f}). Notification dispatched to {to_email}.",
            is_read=False,
            created_at=datetime.utcnow()
        )
        db.add(notif_record)

        # 3. Update Meter state in database
        meter.last_alert_type = "critical" if is_critical else "low"
        meter.last_alert_sent_at = datetime.utcnow()

        db.commit()
    except Exception as db_err:
        logger.error(f"Error saving alert log to database: {db_err}")
        db.rollback()

    return delivery_status in ["sent", "simulated"]
