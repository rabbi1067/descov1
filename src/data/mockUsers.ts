import { User } from '../types';

/**
 * 3 Canonical Accounts for DESCO Smart Balance Monitor:
 * 1. Citizen Consumer (user) -> Tanzil Ahmed (owns the prepaid meter)
 * 2. Operations Admin (admin) -> Engr. Mahmudul Hasan (monitors grid & dispatches alerts, no personal meters)
 * 3. Root Super Admin (super_admin) -> Fazley Rabbi (executive governance & system settings, no personal meters)
 */

export const FIXED_SUPER_ADMIN_ID = 'usr-super-root';

export const mockUsers: User[] = [
  // 1. Citizen Consumer (owns the prepaid meter)
  {
    id: 'usr-consumer-01',
    name: 'Tanzil Ahmed',
    email: 'user@desco.com',
    role: 'user',
    position: 'Residential Citizen Consumer',
    phone: '+880 1712-345678',
    address: 'House 14, Road 7, Sector 4, Uttara, Dhaka-1230',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-01-15T08:00:00Z',
    status: 'active',
    metersCount: 1,
  },
  // 2. Operations Admin (grid officer, DOES NOT own consumer meters)
  {
    id: 'usr-admin-01',
    name: 'Engr. Mahmudul Hasan',
    email: 'admin@desco.com',
    role: 'admin',
    position: 'Divisional Grid Operations Officer',
    phone: '+880 1715-998877',
    address: 'DESCO Zone Operations Center, Mirpur-10, Dhaka',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-02-01T09:00:00Z',
    status: 'active',
    metersCount: 0,
  },
  // 3. Permanent Root Super Administrator (executive grid controller, DOES NOT own consumer meters)
  {
    id: 'usr-super-root',
    name: 'Fazley Rabbi',
    email: 'fazlerabbii2000@gmail.com',
    role: 'super_admin',
    position: 'Chief Systems Administrator & Grid Controller',
    phone: '+880 1700-000000',
    address: 'DESCO Corporate Headquarters, Nikunja-2, Dhaka',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2024-01-01T00:00:00Z',
    status: 'active',
    metersCount: 0,
  },
];
