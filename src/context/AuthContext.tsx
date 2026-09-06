import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { mockUsers, FIXED_SUPER_ADMIN_ID } from '../data/mockUsers';
import { authService } from '../services/auth';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string, phone?: string, address?: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => void;
  transferSuperAdmin: (newAdmin: { name: string; email: string; phone?: string; position?: string }) => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  checkEmailExists: (email: string) => { exists: boolean; user?: User };
  resetPasswordByEmail: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  // Helper to fetch custom super admin from localStorage if configured
  const getEffectiveSuperAdmin = (): User => {
    try {
      const customStr = localStorage.getItem('desco_custom_super_admin');
      if (customStr) {
        return JSON.parse(customStr);
      }
    } catch {
      // ignore
    }
    return mockUsers.find((u) => u.role === 'super_admin') || mockUsers[2];
  };

  // Helper to fetch stored password for any email (defaults to '123456')
  const getUserPassword = (email: string): string => {
    try {
      const raw = localStorage.getItem('desco_user_passwords');
      if (raw) {
        const map = JSON.parse(raw);
        if (map[email.trim().toLowerCase()]) {
          return map[email.trim().toLowerCase()];
        }
      }
    } catch {
      // ignore
    }
    return '123456';
  };

  // Helper to persist password for an email
  const setUserPassword = (email: string, pass: string) => {
    try {
      const raw = localStorage.getItem('desco_user_passwords');
      const map = raw ? JSON.parse(raw) : {};
      map[email.trim().toLowerCase()] = pass;
      localStorage.setItem('desco_user_passwords', JSON.stringify(map));
    } catch {
      // ignore
    }
  };

  // Helper to get all registered accounts (canonical mockUsers + custom super admin + registered users in directory)
  const getAllRegisteredUsers = (): User[] => {
    const list: User[] = [...mockUsers];
    try {
      const customSuperAdmin = localStorage.getItem('desco_custom_super_admin');
      if (customSuperAdmin) {
        const parsed: User = JSON.parse(customSuperAdmin);
        const idx = list.findIndex((u) => u.role === 'super_admin' || u.id === FIXED_SUPER_ADMIN_ID);
        if (idx >= 0) {
          list[idx] = parsed;
        } else {
          list.push(parsed);
        }
      }
      const savedUsers = localStorage.getItem('desco_users_directory');
      if (savedUsers) {
        const extraUsers: User[] = JSON.parse(savedUsers);
        extraUsers.forEach((eu) => {
          if (!list.some((u) => u.email.toLowerCase() === eu.email.toLowerCase())) {
            list.push(eu);
          }
        });
      }
    } catch {
      // ignore
    }
    return list;
  };

  const checkEmailExists = (email: string): { exists: boolean; user?: User } => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return { exists: false };
    const allUsers = getAllRegisteredUsers();
    const found = allUsers.find((u) => u.email.trim().toLowerCase() === normalized);
    return { exists: !!found, user: found };
  };

  const resetPasswordByEmail = async (
    email: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normalized = email.trim().toLowerCase();
    const { exists, user: targetUser } = checkEmailExists(normalized);
    if (!exists) {
      return {
        success: false,
        error: 'No registered account found with this email address in our database.',
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: 'New password must be at least 6 characters long.',
      };
    }

    setUserPassword(normalized, newPassword);

    // Audit log
    try {
      const logsRaw = localStorage.getItem('desco_audit_logs');
      const logs = logsRaw ? JSON.parse(logsRaw) : [];
      logs.unshift({
        id: `audit-${Date.now()}`,
        action: 'PASSWORD_RESET_RECOVERY',
        performedBy: normalized,
        details: `Password was reset via Email recovery for ${targetUser?.name || normalized} (${targetUser?.role || 'user'})`,
        timestamp: new Date().toISOString(),
        severity: 'warning',
      });
      localStorage.setItem('desco_audit_logs', JSON.stringify(logs.slice(0, 100)));
    } catch {
      // ignore
    }

    toast.success('Your password has been reset successfully. Please sign in with your new password.', 'Password Reset');
    return { success: true };
  };

  // Initialize active user session from sessionStorage
  // CRITICAL SECURITY FIX: Never auto-login. On 1st time open / browser launch, users are ALWAYS logged out.
  // Proactively purge legacy persistent sessions from localStorage.
  useEffect(() => {
    try {
      // Clear legacy persistent sessions so existing browser caches don't keep users auto-logged in
      localStorage.removeItem('desco_active_user');
      localStorage.removeItem('desco_auth_token');

      const savedUser = sessionStorage.getItem('desco_active_user');
      const token = sessionStorage.getItem('desco_auth_token');

      if (savedUser && token) {
        const parsed: User = JSON.parse(savedUser);
        if (parsed.role === 'super_admin' || parsed.id === FIXED_SUPER_ADMIN_ID) {
          const effectiveSuperAdmin = getEffectiveSuperAdmin();
          setUser({ ...effectiveSuperAdmin, ...parsed, role: 'super_admin' });
        } else {
          // Match against canonical accounts by id, email, or role
          const matched = mockUsers.find(
            (u) =>
              u.id === parsed.id ||
              u.email.toLowerCase() === parsed.email.toLowerCase()
          );
          if (matched) {
            setUser({ ...matched, ...parsed, role: matched.role });
          } else {
            setUser(parsed);
          }
        }
      } else {
        // No active session - keep unauthenticated
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // 1. Attempt API authentication with the backend
      const apiResponse = await authService.login({ email: normalizedEmail, password });
      if (apiResponse && apiResponse.token && apiResponse.user) {
        const authenticatedUser: User = {
          id: apiResponse.user.id,
          name: apiResponse.user.name,
          email: apiResponse.user.email,
          role: apiResponse.user.role,
          position: apiResponse.user.position,
          phone: apiResponse.user.phone || '',
          address: apiResponse.user.address || '',
          avatar: apiResponse.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          createdAt: apiResponse.user.createdAt || new Date().toISOString(),
          status: apiResponse.user.status || 'active',
          metersCount: apiResponse.user.role === 'user' ? 1 : 0,
        };
        setUser(authenticatedUser);
        sessionStorage.setItem('desco_active_user', JSON.stringify(authenticatedUser));
        sessionStorage.setItem('desco_auth_token', apiResponse.token);
        localStorage.removeItem('desco_active_user');
        localStorage.removeItem('desco_auth_token');
        setIsLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      console.info('Backend authentication offline, using database accounts:', err?.message);
    }

    // 2. Check if the email exists in our registered database
    const allUsers = getAllRegisteredUsers();
    const matchedUser = allUsers.find((u) => u.email.trim().toLowerCase() === normalizedEmail);

    if (!matchedUser) {
      setIsLoading(false);
      return {
        success: false,
        error: 'No registered account found with this email in our database. Please check your spelling or register a new account.',
      };
    }

    const expectedPassword = getUserPassword(normalizedEmail);
    const isPasswordValid = password === expectedPassword || (password === '123456' && expectedPassword === '123456');

    if (!isPasswordValid) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Incorrect password for this account. Please verify your password or use Forgot Password.',
      };
    }

    // If Super Admin
    if (matchedUser.role === 'super_admin' || matchedUser.id === FIXED_SUPER_ADMIN_ID) {
      const superAdmin = getEffectiveSuperAdmin();
      setUser(superAdmin);
      sessionStorage.setItem('desco_active_user', JSON.stringify(superAdmin));
      sessionStorage.setItem('desco_auth_token', `jwt-desco-${superAdmin.id}`);
      localStorage.removeItem('desco_active_user');
      localStorage.removeItem('desco_auth_token');
      setIsLoading(false);
      return { success: true };
    }

    // Citizen or Operations Admin
    setUser(matchedUser);
    sessionStorage.setItem('desco_active_user', JSON.stringify(matchedUser));
    sessionStorage.setItem('desco_auth_token', `jwt-desco-${matchedUser.id}`);
    localStorage.removeItem('desco_active_user');
    localStorage.removeItem('desco_auth_token');
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('desco_active_user');
    sessionStorage.removeItem('desco_auth_token');
    localStorage.removeItem('desco_active_user');
    localStorage.removeItem('desco_auth_token');
    toast.info('You have been securely signed out.', 'Logged Out');
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    address?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered in the database
    const { exists: alreadyExists } = checkEmailExists(normalizedEmail);
    if (alreadyExists) {
      setIsLoading(false);
      return {
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.',
      };
    }

    if (!password || password.length < 6) {
      setIsLoading(false);
      return {
        success: false,
        error: 'Password must be at least 6 characters long.',
      };
    }

    try {
      const apiResponse = await authService.register({ name, email: normalizedEmail, password, phone });
      if (apiResponse && apiResponse.user) {
        const newUser: User = {
          id: apiResponse.user.id,
          name: apiResponse.user.name,
          email: apiResponse.user.email,
          role: apiResponse.user.role || 'user',
          phone: phone || '',
          address: address || '',
          createdAt: new Date().toISOString(),
          status: 'active',
          metersCount: 1,
        };
        setUserPassword(normalizedEmail, password);
        setUser(newUser);
        sessionStorage.setItem('desco_active_user', JSON.stringify(newUser));
        sessionStorage.setItem('desco_auth_token', apiResponse.token || `jwt-desco-${newUser.id}`);
        localStorage.removeItem('desco_active_user');
        localStorage.removeItem('desco_auth_token');
        setIsLoading(false);
        toast.success('Account created successfully! Welcome to DESCO Monitor.', 'Registration Complete');
        return { success: true };
      }
    } catch {
      // Fallback
    }

    const localUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email: normalizedEmail,
      role: 'user',
      phone: phone || '',
      address: address || '',
      createdAt: new Date().toISOString(),
      status: 'active',
      metersCount: 1,
    };

    // Store user password securely
    setUserPassword(normalizedEmail, password);

    setUser(localUser);
    sessionStorage.setItem('desco_active_user', JSON.stringify(localUser));
    sessionStorage.setItem('desco_auth_token', `jwt-desco-${localUser.id}`);
    localStorage.removeItem('desco_active_user');
    localStorage.removeItem('desco_auth_token');

    // Sync to users directory
    try {
      const savedUsers = localStorage.getItem('desco_users_directory');
      const list: User[] = savedUsers ? JSON.parse(savedUsers) : [...mockUsers];
      if (!list.some((u) => u.email.toLowerCase() === localUser.email.toLowerCase())) {
        list.push(localUser);
        localStorage.setItem('desco_users_directory', JSON.stringify(list));
      }
    } catch {
      // ignore
    }

    setIsLoading(false);
    toast.success('Account registered successfully! Welcome to DESCO Monitor.', 'Registration Complete');
    return { success: true };
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    
    // Protect root super admin ID and role
    if (user.id === FIXED_SUPER_ADMIN_ID || user.role === 'super_admin') {
      data.id = FIXED_SUPER_ADMIN_ID;
      data.role = 'super_admin';
    }
    const updated = { ...user, ...data };
    setUser(updated);
    sessionStorage.setItem('desco_active_user', JSON.stringify(updated));

    // If super admin is editing their profile, persist to custom super admin
    if (user.role === 'super_admin') {
      localStorage.setItem('desco_custom_super_admin', JSON.stringify(updated));
    }

    // Also synchronize to the users directory
    try {
      const savedUsers = localStorage.getItem('desco_users_directory');
      if (savedUsers) {
        const list: User[] = JSON.parse(savedUsers);
        const idx = list.findIndex(
          (u) => u.id === updated.id || u.role === 'super_admin'
        );
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...updated };
        } else {
          list.push(updated);
        }
        localStorage.setItem('desco_users_directory', JSON.stringify(list));
      } else {
        localStorage.setItem('desco_users_directory', JSON.stringify([updated]));
      }
    } catch {
      // ignore
    }

    toast.success('Your profile changes have been saved successfully.', 'Profile Updated');
  };

  const transferSuperAdmin = (newAdmin: {
    name: string;
    email: string;
    phone?: string;
    position?: string;
  }) => {
    const updatedSuperAdmin: User = {
      id: FIXED_SUPER_ADMIN_ID,
      name: newAdmin.name.trim(),
      email: newAdmin.email.trim().toLowerCase(),
      role: 'super_admin',
      position: newAdmin.position?.trim() || 'Chief Operations & Grid Director',
      phone: newAdmin.phone?.trim() || '+880 1711-000000',
      address: 'DESCO Headquarters, Nikunja-2, Dhaka',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      metersCount: 0,
    };

    localStorage.setItem('desco_custom_super_admin', JSON.stringify(updatedSuperAdmin));

    // Update directory
    try {
      const savedUsers = localStorage.getItem('desco_users_directory');
      const list: User[] = savedUsers ? JSON.parse(savedUsers) : [...mockUsers];
      const idx = list.findIndex((u) => u.role === 'super_admin' || u.id === FIXED_SUPER_ADMIN_ID);
      if (idx >= 0) {
        list[idx] = updatedSuperAdmin;
      } else {
        list.push(updatedSuperAdmin);
      }
      localStorage.setItem('desco_users_directory', JSON.stringify(list));
    } catch {
      // ignore
    }

    if (user?.role === 'super_admin') {
      setUser(updatedSuperAdmin);
      sessionStorage.setItem('desco_active_user', JSON.stringify(updatedSuperAdmin));
    }

    toast.success(
      `Root Super Admin role has been successfully transferred to ${newAdmin.name} (${newAdmin.email})`,
      'Super Admin Transferred'
    );
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User is not logged in.' };
    }
    const email = user.email.toLowerCase();
    const currentStored = getUserPassword(email);

    if (currentPassword !== currentStored) {
      return {
        success: false,
        error: 'Current password does not match.',
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: 'New password must be at least 6 characters.',
      };
    }

    setUserPassword(email, newPassword);

    // Also record audit log
    try {
      const logsRaw = localStorage.getItem('desco_audit_logs');
      const logs = logsRaw ? JSON.parse(logsRaw) : [];
      logs.unshift({
        id: `audit-${Date.now()}`,
        action: 'PASSWORD_UPDATED',
        performedBy: user.email,
        details: `Password changed securely for account ${user.email} (${user.role})`,
        timestamp: new Date().toISOString(),
        severity: 'info',
      });
      localStorage.setItem('desco_audit_logs', JSON.stringify(logs.slice(0, 100)));
    } catch {
      // ignore
    }

    toast.success('Your password has been changed successfully.', 'Password Changed');
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        updateProfile,
        transferSuperAdmin,
        changePassword,
        checkEmailExists,
        resetPasswordByEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
