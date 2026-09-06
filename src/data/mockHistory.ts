import { BalanceRecord, RechargeRecord } from '../types';

/**
 * Realistic balance history for mtr-001 (Uttara Residence)
 * Matches prompt example:
 * 01 Sep: 500
 * 02 Sep: 420
 * 03 Sep: 350
 * 04 Sep: 260
 * 05 Sep: 240
 * Plus extended history
 */
export const mockBalanceHistory: Record<string, BalanceRecord[]> = {
  'mtr-001': [
    { id: 'bh-35', meterId: 'mtr-001', date: '2026-08-02', balance: 520, consumption: 70 },
    { id: 'bh-34', meterId: 'mtr-001', date: '2026-08-03', balance: 445, consumption: 75 },
    { id: 'bh-33', meterId: 'mtr-001', date: '2026-08-04', balance: 365, consumption: 80 },
    { id: 'bh-32', meterId: 'mtr-001', date: '2026-08-05', balance: 295, consumption: 70 },
    { id: 'bh-31', meterId: 'mtr-001', date: '2026-08-06', balance: 215, consumption: 80 },
    { id: 'bh-30', meterId: 'mtr-001', date: '2026-08-07', balance: 135, consumption: 80 },
    { id: 'bh-29', meterId: 'mtr-001', date: '2026-08-08', balance: 1050, consumption: 85, isRecharge: true, rechargeAmount: 1000 },
    { id: 'bh-28', meterId: 'mtr-001', date: '2026-08-09', balance: 975, consumption: 75 },
    { id: 'bh-27', meterId: 'mtr-001', date: '2026-08-10', balance: 900, consumption: 75 },
    { id: 'bh-26', meterId: 'mtr-001', date: '2026-08-11', balance: 830, consumption: 70 },
    { id: 'bh-25', meterId: 'mtr-001', date: '2026-08-12', balance: 745, consumption: 85 },
    { id: 'bh-24', meterId: 'mtr-001', date: '2026-08-13', balance: 665, consumption: 80 },
    { id: 'bh-23', meterId: 'mtr-001', date: '2026-08-14', balance: 590, consumption: 75 },
    { id: 'bh-22', meterId: 'mtr-001', date: '2026-08-15', balance: 1515, consumption: 75, isRecharge: true, rechargeAmount: 1000 },
    { id: 'bh-21', meterId: 'mtr-001', date: '2026-08-16', balance: 1435, consumption: 80 },
    { id: 'bh-20', meterId: 'mtr-001', date: '2026-08-17', balance: 1350, consumption: 85 },
    { id: 'bh-19', meterId: 'mtr-001', date: '2026-08-18', balance: 1280, consumption: 70 },
    { id: 'bh-18', meterId: 'mtr-001', date: '2026-08-19', balance: 1205, consumption: 75 },
    { id: 'bh-17', meterId: 'mtr-001', date: '2026-08-20', balance: 1120, consumption: 85 },
    { id: 'bh-16', meterId: 'mtr-001', date: '2026-08-21', balance: 1045, consumption: 75 },
    { id: 'bh-15', meterId: 'mtr-001', date: '2026-08-22', balance: 975, consumption: 70 },
    { id: 'bh-14', meterId: 'mtr-001', date: '2026-08-23', balance: 1120, consumption: 80 },
    { id: 'bh-13', meterId: 'mtr-001', date: '2026-08-24', balance: 1045, consumption: 75 },
    { id: 'bh-12', meterId: 'mtr-001', date: '2026-08-25', balance: 960, consumption: 85 },
    { id: 'bh-11', meterId: 'mtr-001', date: '2026-08-26', balance: 880, consumption: 80 },
    { id: 'bh-10', meterId: 'mtr-001', date: '2026-08-27', balance: 790, consumption: 90 },
    { id: 'bh-09', meterId: 'mtr-001', date: '2026-08-28', balance: 710, consumption: 80 },
    { id: 'bh-08', meterId: 'mtr-001', date: '2026-08-29', balance: 625, consumption: 85 },
    { id: 'bh-07', meterId: 'mtr-001', date: '2026-08-30', balance: 550, consumption: 75 },
    { id: 'bh-06', meterId: 'mtr-001', date: '2026-08-31', balance: 480, consumption: 70 },
    { id: 'bh-05', meterId: 'mtr-001', date: '2026-09-01', balance: 500, consumption: 80, isRecharge: true, rechargeAmount: 100 },
    { id: 'bh-04', meterId: 'mtr-001', date: '2026-09-02', balance: 420, consumption: 80 },
    { id: 'bh-03', meterId: 'mtr-001', date: '2026-09-03', balance: 350, consumption: 70 },
    { id: 'bh-02', meterId: 'mtr-001', date: '2026-09-04', balance: 260, consumption: 90 },
    { id: 'bh-01', meterId: 'mtr-001', date: '2026-09-05', balance: 78.18, consumption: 20 },
  ],
};

export const mockRechargeHistory: RechargeRecord[] = [
  {
    id: 'rch-01',
    meterId: 'mtr-001',
    meterNumber: '066120003770',
    date: '2026-09-01T10:14:00Z',
    amount: 1000,
    transactionId: 'TXN-BK-992140',
    paymentMethod: 'bKash',
    status: 'success',
    balanceAfter: 1240,
  },
  {
    id: 'rch-02',
    meterId: 'mtr-001',
    meterNumber: '066120003770',
    date: '2026-08-15T14:30:00Z',
    amount: 1000,
    transactionId: 'TXN-NG-774102',
    paymentMethod: 'Nagad',
    status: 'success',
    balanceAfter: 1515,
  },
  {
    id: 'rch-03',
    meterId: 'mtr-001',
    meterNumber: '066120003770',
    date: '2026-08-08T09:45:00Z',
    amount: 1000,
    transactionId: 'TXN-BK-883912',
    paymentMethod: 'bKash',
    status: 'success',
    balanceAfter: 1050,
  },
  {
    id: 'rch-04',
    meterId: 'mtr-001',
    meterNumber: '066120003770',
    date: '2026-07-29T18:20:00Z',
    amount: 1000,
    transactionId: 'TXN-RK-445019',
    paymentMethod: 'Rocket',
    status: 'success',
    balanceAfter: 1105,
  },
];
