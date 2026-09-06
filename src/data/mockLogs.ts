import { AuditLog } from '../types';

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-09-05T07:15:20Z',
    actorEmail: 'system@desco.com',
    actorRole: 'super_admin',
    action: 'AUTO_BALANCE_POLL',
    target: 'Meter #066120003770 (Fazley Rabbi Residence)',
    ipAddress: '10.0.4.12',
    status: 'success',
  },
  {
    id: 'log-102',
    timestamp: '2026-09-05T07:15:22Z',
    actorEmail: 'system@desco.com',
    actorRole: 'super_admin',
    action: 'DISPATCH_EMAIL_ALERT',
    target: 'fazlerabbii2000@gmail.com (Critical Balance: ৳78.18)',
    ipAddress: '10.0.4.18',
    status: 'success',
  },
  {
    id: 'log-103',
    timestamp: '2026-09-05T07:00:11Z',
    actorEmail: 'super@desco.com',
    actorRole: 'super_admin',
    action: 'MANUAL_SYNC_TRIGGER',
    target: 'DESCO Gateway Telemetry Poller',
    ipAddress: '103.14.88.21',
    status: 'success',
  },
  {
    id: 'log-104',
    timestamp: '2026-09-04T22:30:15Z',
    actorEmail: 'super@desco.com',
    actorRole: 'super_admin',
    action: 'UPDATE_GLOBAL_THRESHOLD',
    target: 'System Default Low: ৳250 -> ৳300',
    ipAddress: '10.0.2.1',
    status: 'success',
  },
];
