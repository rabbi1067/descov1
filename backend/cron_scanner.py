#!/usr/bin/env python3
# ==============================================================================
# DESCO Smart Prepaid Meter - Automated Multi-User Multi-Meter Cron Scanner
# ==============================================================================
# This script can be run directly from local terminal, crontab, or GitHub Actions.
# It scans all registered users and their prepaid meters in the database (desco1):
# 1. Fetches real-time telemetry from DESCO gateway per meter.
# 2. Evaluates individual custom thresholds per meter (e.g., 200, 300, 100 BDT).
# 3. Dispatches automated low and critical balance alert emails when breached.
# 4. Permanently saves balance snapshots and alert dispatch records into MySQL.
# ==============================================================================

import os
import sys
import argparse
from datetime import datetime, timedelta
import logging

# Ensure local backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from database import SessionLocal, engine, Base
import models
from desco_service import fetch_desco_meter_info_sync
from email_service import send_meter_alert

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("cron_scanner")

def run_scanner(force_alert: bool = False, dry_run: bool = False):
    """
    Main scanner engine:
    Processes multi-user and multi-meter fleets sequentially.
    """
    print("\n" + "=" * 70)
    print("⚡ [DESCO AUTOMATED CRON ENGINE] Starting Grid Telemetry Scan...")
    print(f"⏰ Execution Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🛠️ Mode: {'DRY RUN (No changes)' if dry_run else 'PRODUCTION EXECUTION'}")
    print(f"🔄 Force Alert Dispatch: {'ENABLED' if force_alert else 'DISABLED (Cooldown Active)'}")
    print("=" * 70 + "\n")

    # Ensure tables exist in database
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    scanned_count = 0
    alerts_triggered = 0
    errors_count = 0
    healthy_count = 0

    try:
        # 1. Retrieve all active meters belonging to active users
        meters = db.query(models.Meter).join(models.User).filter(models.User.status == "active").all()
        
        if not meters:
            logger.warning("[!] No active meters found in MySQL database 'desco1'. Please run schema.sql first.")
            return

        logger.info(f"[*] Found {len(meters)} meter(s) across registered users. Initiating sequential audit...\n")

        for idx, meter in enumerate(meters, start=1):
            scanned_count += 1
            user_name = meter.user.name if meter.user else "Unknown Citizen"
            print(f"----------------------------------------------------------------------")
            print(f"[{idx}/{len(meters)}] Scanning Meter: '{meter.name}' (#{meter.meter_number})")
            print(f"     Owner: {user_name} ({meter.user_email})")
            print(f"     Configured Thresholds -> Low: ৳{meter.low_threshold:.2f} | Critical: ৳{meter.critical_threshold:.2f}")

            # 2. Fetch live balance from DESCO telemetry gateway
            telemetry = fetch_desco_meter_info_sync(meter.account_number, meter.meter_number)
            live_balance = float(telemetry.get("balance", meter.current_balance))
            previous_balance = meter.current_balance

            print(f"     Live Balance: ৳{live_balance:.2f} BDT (Prev: ৳{previous_balance:.2f}) [Source: {telemetry.get('source')}]")

            if dry_run:
                print("     [DRY RUN] Skipping database writes and email dispatch.")
                continue

            # 3. Store snapshot entry in balance_history table
            try:
                consumption = max(0.0, round(previous_balance - live_balance, 2)) if previous_balance > live_balance else 0.0
                is_recharge = live_balance > previous_balance + 10.0
                recharge_amt = round(live_balance - previous_balance, 2) if is_recharge else None

                history_entry = models.BalanceHistory(
                    meter_id=meter.id,
                    reading_date=datetime.utcnow(),
                    balance=live_balance,
                    consumption=consumption,
                    is_recharge=is_recharge,
                    recharge_amount=recharge_amt
                )
                db.add(history_entry)
            except Exception as hist_err:
                logger.warning(f"     Could not record balance snapshot: {hist_err}")

            # 4. Multi-threshold evaluation
            needs_alert = False
            urgency = "none"
            triggered_threshold = 0.0

            # Threshold Check 1: Critical or emergency balance
            if live_balance <= meter.critical_threshold:
                urgency = "critical"
                triggered_threshold = meter.critical_threshold
                meter.status = "critical"
                # Check cooldown to prevent notification spamming
                if force_alert or meter.last_alert_type != "critical" or (meter.last_alert_sent_at and datetime.utcnow() - meter.last_alert_sent_at > timedelta(hours=6)):
                    needs_alert = True

            # Threshold Check 2: Low balance warning threshold (e.g. 200 or 300 BDT)
            elif live_balance <= meter.low_threshold:
                urgency = "warning"
                triggered_threshold = meter.low_threshold
                meter.status = "low"
                if force_alert or meter.last_alert_type != "low" or (meter.last_alert_sent_at and datetime.utcnow() - meter.last_alert_sent_at > timedelta(hours=12)):
                    needs_alert = True

            # Balance recovered above thresholds
            else:
                meter.status = "healthy"
                meter.last_alert_type = "none"
                healthy_count += 1
                print(f"     Status: ✅ HEALTHY (Balance is above all thresholds)")

            # 5. Update meter telemetry in database
            meter.current_balance = live_balance
            meter.last_updated = datetime.utcnow()

            # 6. Dispatch email notification if threshold is breached
            if needs_alert and meter.auto_email_alert:
                print(f"     🚨 THRESHOLD BREACHED: ৳{live_balance:.2f} <= ৳{triggered_threshold:.2f} [{urgency.upper()} ALERT]")
                print(f"     📨 Dispatching professional alert email to: {meter.notification_email}")
                
                success = send_meter_alert(
                    db=db,
                    meter=meter,
                    current_balance=live_balance,
                    threshold_value=triggered_threshold,
                    urgency=urgency
                )

                if success:
                    alerts_triggered += 1
                    print(f"     [✓] Email dispatched and recorded in MySQL 'alert_dispatches' table.")
                else:
                    errors_count += 1
                    print(f"     [X] Email dispatch failed or logged as simulation.")
            elif needs_alert and not meter.auto_email_alert:
                print("     [i] Threshold breached, but auto_email_alert is disabled for this meter.")

            # Commit per-meter transaction
            db.commit()

        # 7. Record scan execution in system audit logs
        audit_entry = models.AuditLog(
            actor_name="DESCO Automated Cron Scanner",
            actor_email="cron@desco.org.bd",
            action="BATCH_GRID_SCAN",
            details=f"Scanned {scanned_count} meters. Dispatched {alerts_triggered} email alerts. Healthy: {healthy_count}.",
            ip_address="127.0.0.1"
        )
        db.add(audit_entry)
        db.commit()

        # 8. Display execution summary
        print("\n" + "=" * 70)
        print("📊 [SCAN COMPLETE] Execution Summary Report:")
        print(f"   • Total Meters Scanned: {scanned_count}")
        print(f"   • Healthy Meters:        {healthy_count}")
        print(f"   • Alerts Dispatched:     {alerts_triggered}")
        print(f"   • Errors Encountered:    {errors_count}")
        print(f"   • Finished At:           {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 70 + "\n")

    except Exception as e:
        logger.error(f"[FATAL] Scanner crashed with exception: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="DESCO Smart Prepaid Meter Automated Scanner")
    parser.add_argument("--force", action="store_true", help="Force send emails ignoring the cooldown period")
    parser.add_argument("--dry-run", action="store_true", help="Inspect meters without writing to DB or emailing")
    args = parser.parse_args()

    run_scanner(force_alert=args.force, dry_run=args.dry_run)

