export type UserRole = 'super_admin' | 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  position?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: string;
  status: 'active' | 'suspended';
  metersCount?: number;
}

export type MeterStatus = 'healthy' | 'low' | 'critical';

export interface Meter {
  id: string;
  name: string;
  meterNumber: string;
  userId: string;
  userEmail: string;
  currentBalance: number;
  lowThreshold: number;
  criticalThreshold: number;
  notificationEmail: string;
  status: MeterStatus;
  lastUpdated: string;
  registeredDate: string;
  accountNumber: string;
  tariffType: string;
  sanctionedLoad: string;
}

export interface BalanceRecord {
  id: string;
  meterId: string;
  date: string;
  balance: number;
  consumption: number;
  isRecharge?: boolean;
  rechargeAmount?: number;
}

export interface RechargeRecord {
  id: string;
  meterId: string;
  meterNumber: string;
  date: string;
  amount: number;
  transactionId: string;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Card' | 'Bank';
  status: 'success' | 'pending' | 'failed';
  balanceAfter: number;
}

export type NotificationType = 'low_balance' | 'critical' | 'recovery' | 'weekly_summary' | 'system';

export interface AppNotification {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  meterId?: string;
  meterNumber?: string;
  meterName?: string;
  balanceAtTrigger?: number;
  thresholdLimit?: number;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  channel?: 'email' | 'in_app' | 'both';
  deliveryStatus?: 'delivered' | 'sent' | 'pending';
}

export interface DispatchAuditRecord {
  id: string;
  timestamp: string;
  meterId: string;
  meterNumber: string;
  meterName: string;
  userId: string;
  userName: string;
  userEmail: string;
  recipientEmail: string;
  currentBalance: number;
  thresholdType: 'low_balance' | 'critical';
  thresholdLimit: number;
  channels: ('email' | 'in_app')[];
  deliveryStatus: 'delivered' | 'sent' | 'queued';
  messagePreview: string;
}

export interface AIPredictionResult {
  currentBalance: number;
  dailyConsumption: number;
  averageUsage: number;
  remainingDays: number;
  suggestedRechargeDate: string;
  confidenceScore: number;
  insight: string;
  recommendation: string;
  urgency: 'safe' | 'warning' | 'critical';
  trendDirection: 'stable' | 'increasing' | 'decreasing';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  target: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'failed';
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notificationEmail: string;
  enableEmailAlerts: boolean;
  enableWeeklySummary: boolean;
  lowThreshold: number;
  criticalThreshold: number;
  language: 'en' | 'bn';
  privacyMode: boolean;
}

export type DashboardSection =
  | 'dashboard'
  | 'meters'
  | 'analytics'
  | 'reports'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'users'
  | 'meter_management'
  | 'admin_management'
  | 'email_config'
  | 'audit_logs'
  | 'system_settings';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  meterNumber?: string;
  phone?: string;
}
