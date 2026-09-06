import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Meter, BalanceRecord, RechargeRecord, AppNotification, AIPredictionResult, DispatchAuditRecord } from '../types';
import { mockMeters } from '../data/mockMeters';
import { mockBalanceHistory, mockRechargeHistory } from '../data/mockHistory';
import { mockNotifications, mockDispatchAuditRecords } from '../data/mockNotifications';
import { mockUsers } from '../data/mockUsers';
import { calculatePrediction } from '../utils/prediction';
import { useAuth } from './AuthContext';

interface MeterContextType {
  meters: Meter[];
  allMeters: Meter[];
  activeMeter: Meter | null;
  setActiveMeterId: (id: string) => void;
  activeHistory: BalanceRecord[];
  allRecharges: RechargeRecord[];
  activeRecharges: RechargeRecord[];
  notifications: AppNotification[];
  allNotifications: AppNotification[];
  dispatchRecords: DispatchAuditRecord[];
  unreadCount: number;
  aiPrediction: AIPredictionResult;
  isSyncing: boolean;
  addMeter: (newMeter: Omit<Meter, 'id' | 'lastUpdated' | 'registeredDate' | 'status'>) => void;
  updateMeter: (id: string, data: Partial<Meter>) => void;
  deleteMeter: (id: string) => void;
  rechargeMeter: (meterId: string, amount: number, method: 'bKash' | 'Nagad' | 'Rocket' | 'Card') => Promise<boolean>;
  refreshMeterBalance: (meterId: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
  runGlobalThresholdScan: () => Promise<{ scanned: number; alertsTriggered: number }>;
  triggerDirectMeterAlert: (meterId: string) => Promise<boolean>;
  updateAllMetersThresholds: (low: number, critical: number) => void;
  recordDispatch: (record: Omit<DispatchAuditRecord, 'id' | 'timestamp'>) => void;
}

const MeterContext = createContext<MeterContextType | undefined>(undefined);

export const MeterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Load meters from localStorage or mock, assigning meters exclusively to consumer accounts
  const [meters, setMeters] = useState<Meter[]>(() => {
    try {
      const saved = localStorage.getItem('desco_meters_data');
      if (saved) {
        const parsed: Meter[] = JSON.parse(saved);
        // Correct any meters mistakenly assigned to super admin back to consumer user
        const corrected = parsed.map((m) => {
          if (m.userId === 'usr-super-root' || m.userEmail === 'fazlerabbii2000@gmail.com') {
            return {
              ...m,
              name: 'Uttara Residence Main Meter',
              meterNumber: m.meterNumber || '066120003770',
              accountNumber: m.accountNumber || '21000736',
              userId: 'usr-consumer-01',
              userEmail: 'user@desco.com',
              notificationEmail: 'user@desco.com',
            };
          }
          return m;
        });
        if (!corrected.some((m) => m.id === 'mtr-001')) {
          corrected.unshift(mockMeters[0]);
        }
        // Ensure fleet meters are present for operations admin monitoring
        const existingIds = new Set(corrected.map((m) => m.id));
        mockMeters.forEach((mm) => {
          if (!existingIds.has(mm.id)) {
            corrected.push(mm);
          }
        });
        return corrected;
      }
      return mockMeters;
    } catch {
      return mockMeters;
    }
  });

  const [activeMeterId, setActiveMeterId] = useState<string>(() => {
    return 'mtr-001';
  });

  const [historyMap, setHistoryMap] = useState<Record<string, BalanceRecord[]>>(() => {
    try {
      const saved = localStorage.getItem('desco_history_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return Object.keys(parsed).length > 0 ? parsed : mockBalanceHistory;
      }
      return mockBalanceHistory;
    } catch {
      return mockBalanceHistory;
    }
  });

  const [recharges, setRecharges] = useState<RechargeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('desco_recharge_data');
      if (saved) {
        const parsed: RechargeRecord[] = JSON.parse(saved);
        return parsed.length > 0 ? parsed : mockRechargeHistory;
      }
      return mockRechargeHistory;
    } catch {
      return mockRechargeHistory;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('desco_notifications_data');
      if (saved) {
        const parsed: AppNotification[] = JSON.parse(saved);
        return parsed.length > 0 ? parsed : mockNotifications;
      }
      return mockNotifications;
    } catch {
      return mockNotifications;
    }
  });

  const [dispatchRecords, setDispatchRecords] = useState<DispatchAuditRecord[]>(() => {
    try {
      const saved = localStorage.getItem('desco_dispatch_records');
      if (saved) {
        const parsed: DispatchAuditRecord[] = JSON.parse(saved);
        return parsed.length > 0 ? parsed : mockDispatchAuditRecords;
      }
      return mockDispatchAuditRecords;
    } catch {
      return mockDispatchAuditRecords;
    }
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('desco_meters_data', JSON.stringify(meters));
  }, [meters]);

  useEffect(() => {
    localStorage.setItem('desco_history_data', JSON.stringify(historyMap));
  }, [historyMap]);

  useEffect(() => {
    localStorage.setItem('desco_recharge_data', JSON.stringify(recharges));
  }, [recharges]);

  useEffect(() => {
    localStorage.setItem('desco_notifications_data', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('desco_dispatch_records', JSON.stringify(dispatchRecords));
  }, [dispatchRecords]);

  // Determine active meters based on role & user
  const visibleMeters = useMemo(() => {
    if (!user) return meters;
    if (user.role === 'super_admin' || user.role === 'admin') {
      return meters;
    }
    // Standard user gets their meters
    const userMeters = meters.filter(
      (m) =>
        m.userId === user.id ||
        m.userEmail?.toLowerCase() === user.email.toLowerCase() ||
        m.notificationEmail?.toLowerCase() === user.email.toLowerCase()
    );
    return userMeters.length > 0 ? userMeters : meters;
  }, [meters, user]);

  const activeMeter = useMemo(() => {
    const found = visibleMeters.find((m) => m.id === activeMeterId);
    return found || visibleMeters[0] || meters[0] || null;
  }, [visibleMeters, activeMeterId, meters]);

  const activeHistory = useMemo(() => {
    if (!activeMeter) return [];
    return historyMap[activeMeter.id] || historyMap['mtr-001'] || [];
  }, [activeMeter, historyMap]);

  const activeRecharges = useMemo(() => {
    if (!activeMeter) return [];
    return recharges.filter((r) => r.meterId === activeMeter.id);
  }, [activeMeter, recharges]);

  // Role-filtered notifications
  const roleFilteredNotifications = useMemo(() => {
    if (!user) return notifications;
    if (user.role === 'admin' || user.role === 'super_admin') {
      return notifications;
    }
    const myMeterIds = new Set(visibleMeters.map((m) => m.id));
    return notifications.filter(
      (n) =>
        n.userId === user.id ||
        n.userEmail === user.email ||
        (n.meterId && myMeterIds.has(n.meterId)) ||
        n.type === 'system'
    );
  }, [notifications, user, visibleMeters]);

  const unreadCount = useMemo(() => {
    return roleFilteredNotifications.filter((n) => !n.read).length;
  }, [roleFilteredNotifications]);

  const aiPrediction = useMemo(() => {
    const balance = activeMeter?.currentBalance ?? 240;
    const low = activeMeter?.lowThreshold ?? 300;
    const critical = activeMeter?.criticalThreshold ?? 100;
    return calculatePrediction(balance, activeHistory, low, critical);
  }, [activeMeter, activeHistory]);

  // Global Threshold Scan Engine: scans all meters, evaluates individual thresholds, dispatches alerts
  const runGlobalThresholdScan = useCallback(async (): Promise<{ scanned: number; alertsTriggered: number }> => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 600));

    let alertsTriggered = 0;
    const newNotifications: AppNotification[] = [];
    const newDispatches: DispatchAuditRecord[] = [];
    const updatedMeters: Meter[] = [];
    const nowIso = new Date().toISOString();

    meters.forEach((meter) => {
      const balance = meter.currentBalance;
      const isCritical = balance <= meter.criticalThreshold;
      const isLow = !isCritical && balance <= meter.lowThreshold;
      const status: Meter['status'] = isCritical ? 'critical' : isLow ? 'low' : 'healthy';

      updatedMeters.push({
        ...meter,
        status,
        lastUpdated: nowIso,
      });

      if (isCritical || isLow) {
        alertsTriggered++;
        const targetUser = mockUsers.find((u) => u.id === meter.userId || u.email === meter.userEmail);
        const userName = targetUser?.name || meter.userEmail;
        const alertType = isCritical ? 'critical' : 'low_balance';
        const title = isCritical
          ? `Emergency Critical Alert: Meter #${meter.meterNumber}`
          : `Low Balance Warning: Meter #${meter.meterNumber}`;
        const message = isCritical
          ? `Meter #${meter.meterNumber} (${meter.name}) balance is ৳${balance}, below critical threshold ৳${meter.criticalThreshold}. Emergency cutoff imminent!`
          : `Meter #${meter.meterNumber} (${meter.name}) balance is ৳${balance}, below warning threshold ৳${meter.lowThreshold}. Please recharge soon.`;

        // Create in-app notification
        newNotifications.push({
          id: `notif-scan-${Date.now()}-${meter.id}`,
          userId: meter.userId,
          userName,
          userEmail: meter.userEmail,
          meterId: meter.id,
          meterNumber: meter.meterNumber,
          meterName: meter.name,
          balanceAtTrigger: balance,
          thresholdLimit: isCritical ? meter.criticalThreshold : meter.lowThreshold,
          title,
          message,
          type: alertType,
          timestamp: nowIso,
          read: false,
          channel: 'both',
          deliveryStatus: 'delivered',
        });

        // Create central dispatch audit record
        newDispatches.push({
          id: `dsp-scan-${Date.now()}-${meter.id}`,
          timestamp: nowIso,
          meterId: meter.id,
          meterNumber: meter.meterNumber,
          meterName: meter.name,
          userId: meter.userId,
          userName,
          userEmail: meter.userEmail,
          recipientEmail: meter.notificationEmail || meter.userEmail,
          currentBalance: balance,
          thresholdType: alertType,
          thresholdLimit: isCritical ? meter.criticalThreshold : meter.lowThreshold,
          channels: ['email', 'in_app'],
          deliveryStatus: 'delivered',
          messagePreview: `${isCritical ? '[CRITICAL]' : '[WARNING]'} ৳${balance} / ৳${isCritical ? meter.criticalThreshold : meter.lowThreshold} limit`,
        });
      }
    });

    setMeters(updatedMeters);
    if (newNotifications.length > 0) {
      setNotifications((prev) => [...newNotifications, ...prev]);
    }
    if (newDispatches.length > 0) {
      setDispatchRecords((prev) => [...newDispatches, ...prev]);
    }

    setIsSyncing(false);
    return { scanned: meters.length, alertsTriggered };
  }, [meters]);

  // Trigger manual email alert to a specific meter/user
  const triggerDirectMeterAlert = async (meterId: string): Promise<boolean> => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 500));

    const target = meters.find((m) => m.id === meterId);
    if (!target) {
      setIsSyncing(false);
      return false;
    }

    const nowIso = new Date().toISOString();
    const isCritical = target.currentBalance <= target.criticalThreshold;
    const alertType = isCritical ? 'critical' : 'low_balance';
    const targetUser = mockUsers.find((u) => u.id === target.userId || u.email === target.userEmail);
    const userName = targetUser?.name || target.userEmail;

    const notif: AppNotification = {
      id: `notif-manual-${Date.now()}`,
      userId: target.userId,
      userName,
      userEmail: target.userEmail,
      meterId: target.id,
      meterNumber: target.meterNumber,
      meterName: target.name,
      balanceAtTrigger: target.currentBalance,
      thresholdLimit: isCritical ? target.criticalThreshold : target.lowThreshold,
      title: `Direct Operations Dispatch: Meter #${target.meterNumber}`,
      message: `Manual dispatch notice: Meter #${target.meterNumber} (${target.name}) current balance is ৳${target.currentBalance}. Threshold set at ৳${target.lowThreshold}. Email notification sent to ${target.notificationEmail || target.userEmail}.`,
      type: alertType,
      timestamp: nowIso,
      read: false,
      channel: 'both',
      deliveryStatus: 'delivered',
    };

    const dispatch: DispatchAuditRecord = {
      id: `dsp-manual-${Date.now()}`,
      timestamp: nowIso,
      meterId: target.id,
      meterNumber: target.meterNumber,
      meterName: target.name,
      userId: target.userId,
      userName,
      userEmail: target.userEmail,
      recipientEmail: target.notificationEmail || target.userEmail,
      currentBalance: target.currentBalance,
      thresholdType: alertType,
      thresholdLimit: isCritical ? target.criticalThreshold : target.lowThreshold,
      channels: ['email', 'in_app'],
      deliveryStatus: 'delivered',
      messagePreview: `Direct officer dispatch: Balance ৳${target.currentBalance} to ${target.notificationEmail || target.userEmail}`,
    };

    setNotifications((prev) => [notif, ...prev]);
    setDispatchRecords((prev) => [dispatch, ...prev]);
    setIsSyncing(false);
    return true;
  };

  // Background automated periodic check: automatically evaluates thresholds every 90 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      // Background silent verification
      setMeters((prevMeters) =>
        prevMeters.map((m) => {
          const isCritical = m.currentBalance <= m.criticalThreshold;
          const isLow = !isCritical && m.currentBalance <= m.lowThreshold;
          const status: Meter['status'] = isCritical ? 'critical' : isLow ? 'low' : 'healthy';
          return { ...m, status };
        })
      );
    }, 90000);

    return () => clearInterval(timer);
  }, []);

  const addMeter = (newMeterData: Omit<Meter, 'id' | 'lastUpdated' | 'registeredDate' | 'status'>) => {
    const status: Meter['status'] =
      newMeterData.currentBalance <= newMeterData.criticalThreshold
        ? 'critical'
        : newMeterData.currentBalance <= newMeterData.lowThreshold
        ? 'low'
        : 'healthy';

    const newMeter: Meter = {
      ...newMeterData,
      id: `mtr-${Date.now().toString().slice(-4)}`,
      status,
      lastUpdated: new Date().toISOString(),
      registeredDate: new Date().toISOString().split('T')[0],
      accountNumber: `DESCO-ACC-${Math.floor(1000 + Math.random() * 9000)}`,
      tariffType: newMeterData.tariffType || 'LT-A (Residential)',
      sanctionedLoad: '4 kW',
    };

    setMeters((prev) => [newMeter, ...prev]);
    setActiveMeterId(newMeter.id);

    // Initial history for this new meter
    const today = new Date();
    const initialHistory: BalanceRecord[] = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dailyDrop = 60 + Math.floor(Math.random() * 30);
      return {
        id: `bh-gen-${newMeter.id}-${i}`,
        meterId: newMeter.id,
        date: d.toISOString().split('T')[0],
        balance: Math.round(newMeter.currentBalance + (6 - i) * dailyDrop),
        consumption: dailyDrop,
      };
    });

    setHistoryMap((prev) => ({
      ...prev,
      [newMeter.id]: initialHistory,
    }));

    // Notification
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: newMeter.userId,
      meterId: newMeter.id,
      meterNumber: newMeter.meterNumber,
      meterName: newMeter.name,
      title: 'Meter Added Successfully',
      message: `Meter "${newMeter.name}" (#${newMeter.meterNumber}) is now active with balance ৳${newMeter.currentBalance}. Assigned thresholds: ৳${newMeter.lowThreshold} warning, ৳${newMeter.criticalThreshold} critical.`,
      type: 'system',
      timestamp: new Date().toISOString(),
      read: false,
      channel: 'both',
      deliveryStatus: 'delivered',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const updateMeter = (id: string, data: Partial<Meter>) => {
    setMeters((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, ...data, lastUpdated: new Date().toISOString() };
        const bal = typeof updated.currentBalance === 'number' ? updated.currentBalance : m.currentBalance;
        const crit = typeof updated.criticalThreshold === 'number' ? updated.criticalThreshold : m.criticalThreshold;
        const low = typeof updated.lowThreshold === 'number' ? updated.lowThreshold : m.lowThreshold;

        updated.status = bal <= crit ? 'critical' : bal <= low ? 'low' : 'healthy';
        return updated;
      })
    );
  };

  const updateAllMetersThresholds = (low: number, critical: number) => {
    setMeters((prev) =>
      prev.map((m) => {
        const bal = m.currentBalance;
        const status: Meter['status'] = bal <= critical ? 'critical' : bal <= low ? 'low' : 'healthy';
        return {
          ...m,
          lowThreshold: low,
          criticalThreshold: critical,
          status,
          lastUpdated: new Date().toISOString(),
        };
      })
    );
  };

  const deleteMeter = (id: string) => {
    setMeters((prev) => prev.filter((m) => m.id !== id));
    if (activeMeterId === id) {
      const remaining = meters.filter((m) => m.id !== id);
      if (remaining.length > 0) {
        setActiveMeterId(remaining[0].id);
      }
    }
  };

  const rechargeMeter = async (meterId: string, amount: number, method: 'bKash' | 'Nagad' | 'Rocket' | 'Card'): Promise<boolean> => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 600));

    const target = meters.find((m) => m.id === meterId);
    if (!target) {
      setIsSyncing(false);
      return false;
    }

    const newBalance = target.currentBalance + amount;
    const newStatus =
      newBalance <= target.criticalThreshold ? 'critical' : newBalance <= target.lowThreshold ? 'low' : 'healthy';

    // Update meter
    setMeters((prev) =>
      prev.map((m) => (m.id === meterId ? { ...m, currentBalance: newBalance, status: newStatus, lastUpdated: new Date().toISOString() } : m))
    );

    // Record recharge
    const newRecharge: RechargeRecord = {
      id: `rch-${Date.now()}`,
      meterId,
      meterNumber: target.meterNumber,
      date: new Date().toISOString(),
      amount,
      transactionId: `TXN-${method.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentMethod: method,
      status: 'success',
      balanceAfter: newBalance,
    };
    setRecharges((prev) => [newRecharge, ...prev]);

    // Update history
    const todayStr = new Date().toISOString().split('T')[0];
    setHistoryMap((prev) => {
      const currentList = prev[meterId] || [];
      const updatedList = [
        ...currentList,
        {
          id: `bh-${Date.now()}`,
          meterId,
          date: todayStr,
          balance: newBalance,
          consumption: 0,
          isRecharge: true,
          rechargeAmount: amount,
        },
      ];
      return { ...prev, [meterId]: updatedList };
    });

    // Add recovery notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: target.userId,
      meterId,
      meterNumber: target.meterNumber,
      meterName: target.name,
      title: 'Recharge Successful',
      message: `৳${amount} recharged successfully via ${method}. New meter balance is ৳${newBalance}.`,
      type: 'recovery',
      timestamp: new Date().toISOString(),
      read: false,
      channel: 'both',
      deliveryStatus: 'delivered',
    };
    setNotifications((prev) => [notif, ...prev]);

    setIsSyncing(false);
    return true;
  };

  const refreshMeterBalance = async (meterId: string) => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 700));
    setMeters((prev) =>
      prev.map((m) => (m.id === meterId ? { ...m, lastUpdated: new Date().toISOString() } : m))
    );
    setIsSyncing(false);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const recordDispatch = useCallback((record: Omit<DispatchAuditRecord, 'id' | 'timestamp'>) => {
    const newRec: DispatchAuditRecord = {
      ...record,
      id: `dsp-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setDispatchRecords((prev) => [newRec, ...prev]);
  }, []);

  return (
    <MeterContext.Provider
      value={{
        meters: visibleMeters,
        allMeters: meters,
        activeMeter,
        setActiveMeterId,
        activeHistory,
        allRecharges: recharges,
        activeRecharges,
        notifications: roleFilteredNotifications,
        allNotifications: notifications,
        dispatchRecords,
        unreadCount,
        aiPrediction,
        isSyncing,
        addMeter,
        updateMeter,
        deleteMeter,
        rechargeMeter,
        refreshMeterBalance,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearNotifications,
        runGlobalThresholdScan,
        triggerDirectMeterAlert,
        updateAllMetersThresholds,
        recordDispatch,
      }}
    >
      {children}
    </MeterContext.Provider>
  );
};

export const useMeters = (): MeterContextType => {
  const context = useContext(MeterContext);
  if (!context) {
    throw new Error('useMeters must be used within a MeterProvider');
  }
  return context;
};
