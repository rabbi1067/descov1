import React, { useState } from 'react';
import { Search, Edit3, Trash2, ShieldAlert, ShieldCheck, Lock } from 'lucide-react';
import { mockUsers, FIXED_SUPER_ADMIN_ID } from '../data/mockUsers';
import { User, UserRole } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const UsersSection: React.FC = () => {
  const toast = useToast();
  const { isBn } = useLanguage();

  const [userList, setUserList] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('desco_users_directory');
      if (saved) {
        const parsed: User[] = JSON.parse(saved);
        if (parsed.length > 0) {
          // Check if custom super admin was saved
          const customSuperAdminStr = localStorage.getItem('desco_custom_super_admin');
          if (customSuperAdminStr) {
            const customSA = JSON.parse(customSuperAdminStr);
            return parsed.map((u) => (u.role === 'super_admin' || u.id === FIXED_SUPER_ADMIN_ID ? { ...u, ...customSA } : u));
          }
          return parsed;
        }
      }
      return mockUsers;
    } catch {
      return mockUsers;
    }
  });

  React.useEffect(() => {
    localStorage.setItem('desco_users_directory', JSON.stringify(userList));
  }, [userList]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    phone: string;
    address: string;
  }>({ name: '', email: '', phone: '', address: '' });

  const filtered = userList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleStatus = (id: string) => {
    if (id === FIXED_SUPER_ADMIN_ID) {
      toast.warning('Root Super Admin (usr-super-root) is permanent and cannot be suspended.', 'Protected Account');
      return;
    }
    const target = userList.find((u) => u.id === id);
    const newStatus = target?.status === 'active' ? 'suspended' : 'active';
    setUserList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
    );
    toast.info(`Account status for ${target?.name} changed to ${newStatus}.`, 'Status Updated');
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === FIXED_SUPER_ADMIN_ID || user.role === 'super_admin') {
      toast.warning('Root Super Admin (usr-super-root) is permanent and cannot be deleted.', 'Protected Account');
      return;
    }
    setDeleteConfirmUser(user);
  };

  const confirmDelete = () => {
    if (!deleteConfirmUser) return;
    if (deleteConfirmUser.id === FIXED_SUPER_ADMIN_ID) {
      setDeleteConfirmUser(null);
      return;
    }
    const deletedName = deleteConfirmUser.name;
    setUserList((prev) => prev.filter((u) => u.id !== deleteConfirmUser.id));
    setDeleteConfirmUser(null);
    toast.success(`User account for ${deletedName} has been deleted.`, 'User Deleted');
  };

  const startEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updatedName = editForm.name.trim();
    const updatedEmail = editForm.email.trim();
    const updatedPhone = editForm.phone.trim();
    const updatedAddress = editForm.address.trim();

    if (editingUser.id === FIXED_SUPER_ADMIN_ID || editingUser.role === 'super_admin') {
      const updatedSuperAdmin = {
        ...editingUser,
        name: updatedName,
        email: updatedEmail,
        phone: updatedPhone,
        address: updatedAddress,
      };
      localStorage.setItem('desco_custom_super_admin', JSON.stringify(updatedSuperAdmin));
    }

    setUserList((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              name: updatedName,
              email: updatedEmail,
              phone: updatedPhone,
              address: updatedAddress,
            }
          : u
      )
    );
    setEditingUser(null);
    toast.success(`Profile for ${updatedName} successfully saved.`, 'User Profile Saved');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isBn ? 'নিবন্ধিত গ্রাহক ও কর্মী তালিকা' : 'Registered Consumers & Staff Directory'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'গ্রাহক অ্যাকাউন্ট, সংযুক্ত মিটার এবং সিস্টেম অ্যাক্সেস অনুমতি পরিচালনা করুন'
              : 'Administer customer accounts, linked meters, and system access authorizations'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {isBn ? 'মোট অ্যাকাউন্ট:' : 'Total Accounts:'} {userList.length}
          </span>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Filter & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBn ? 'নাম বা ইমেইল দিয়ে খুঁজুন...' : 'Search by name or email...'}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {(['all', 'user', 'admin', 'super_admin'] as const).map((r) => {
            const roleLabels: Record<string, string> = {
              all: isBn ? 'সকল' : 'All',
              user: isBn ? 'গ্রাহক' : 'User',
              admin: isBn ? 'অ্যাডমিন' : 'Admin',
              super_admin: isBn ? 'সুপার অ্যাডমিন' : 'Super Admin',
            };
            return (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 cursor-pointer ${
                  roleFilter === r
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {roleLabels[r]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4">{isBn ? 'ব্যবহারকারী' : 'User'}</th>
                <th className="py-3 px-4">{isBn ? 'ভূমিকা ও অনুমতি' : 'Role & Privileges'}</th>
                <th className="py-3 px-4">{isBn ? 'ফোন / ঠিকানা' : 'Phone / Address'}</th>
                <th className="py-3 px-4">{isBn ? 'মিটার' : 'Meters'}</th>
                <th className="py-3 px-4">{isBn ? 'অবস্থা' : 'Status'}</th>
                <th className="py-3 px-4 text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((u) => {
                const isRootSuperAdmin = u.id === FIXED_SUPER_ADMIN_ID;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                          }}
                          referrerPolicy="no-referrer"
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{u.name}</p>
                            {isRootSuperAdmin && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                                <Lock className="w-2.5 h-2.5" /> {isBn ? 'মূল সুপার অ্যাডমিন' : 'Root Fixed'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <Badge
                          variant={
                            u.role === 'super_admin' ? 'critical' : u.role === 'admin' ? 'info' : 'neutral'
                          }
                          size="sm"
                        >
                          {u.role === 'super_admin'
                            ? isBn
                              ? 'সুপার অ্যাডমিন'
                              : 'Super Admin'
                            : u.role === 'admin'
                            ? isBn
                              ? 'অ্যাডমিন'
                              : 'Admin'
                            : isBn
                            ? 'গ্রাহক'
                            : 'User'}
                        </Badge>
                        {isRootSuperAdmin && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            {isBn ? 'স্থায়ী অপরিবর্তনীয়' : 'Permanent Non-deletable'}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-700 dark:text-slate-300 font-mono">{u.phone}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{u.address}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {u.metersCount || 1} {isBn ? 'টি মিটার' : 'Meters'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {u.status === 'active' ? (isBn ? 'সক্রিয়' : 'Active') : isBn ? 'স্থগিত' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditUser(u)}
                          leftIcon={<Edit3 className="w-3.5 h-3.5 text-slate-500" />}
                          title={isBn ? 'ব্যবহারকারীর বিবরণ সম্পাদনা' : 'Edit user details'}
                        >
                          {isBn ? 'সম্পাদনা' : 'Edit'}
                        </Button>
                        <Button
                          size="sm"
                          variant={u.status === 'active' ? 'outline' : 'primary'}
                          disabled={isRootSuperAdmin}
                          onClick={() => toggleStatus(u.id)}
                          title={
                            isRootSuperAdmin
                              ? isBn
                                ? 'মূল সুপার অ্যাডমিন স্থগিত করা যাবে না'
                                : 'Root Super Admin cannot be suspended'
                              : undefined
                          }
                        >
                          {u.status === 'active'
                            ? isBn
                              ? 'স্থগিত করুন'
                              : 'Suspend'
                            : isBn
                            ? 'সক্রিয় করুন'
                            : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={isRootSuperAdmin}
                          onClick={() => handleDeleteUser(u)}
                          title={
                            isRootSuperAdmin
                              ? isBn
                                ? 'মূল সুপার অ্যাডমিন মুছে ফেলা যাবে না'
                                : 'Root Super Admin is permanent and cannot be deleted'
                              : isBn
                              ? 'অ্যাকাউন্ট মুছুন'
                              : 'Delete user account'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Consumer Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={isBn ? `ব্যবহারকারী সম্পাদনা: ${editingUser?.name || ''}` : `Edit User: ${editingUser?.name || ''}`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'পূর্ণ নাম *' : 'Full Name *'}
            </label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {isBn ? 'অফিসিয়াল ইমেইল ঠিকানা *' : 'Official Email Address *'}
            </label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'ফোন নম্বর' : 'Phone Number'}
              </label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'গ্রাহকের ঠিকানা' : 'Premises Address'}
              </label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="ghost" type="button" onClick={() => setEditingUser(null)}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button size="sm" variant="primary" type="submit">
              {isBn ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmUser}
        onClose={() => setDeleteConfirmUser(null)}
        title={isBn ? 'অ্যাকাউন্ট মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Account Deletion'}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {isBn ? (
              <>
                আপনি কি নিশ্চিত যে আপনি{' '}
                <strong className="text-slate-900 dark:text-white">{deleteConfirmUser?.name}</strong> (
                {deleteConfirmUser?.email})-এর অ্যাকাউন্টটি স্থায়ীভাবে মুছে ফেলতে চান? সমস্ত সংযুক্ত মিটার অ্যাক্সেস প্রত্যাহার করা হবে।
              </>
            ) : (
              <>
                Are you sure you want to permanently delete the user account for{' '}
                <strong className="text-slate-900 dark:text-white">{deleteConfirmUser?.name}</strong> (
                {deleteConfirmUser?.email})? All associated meter access will be revoked.
              </>
            )}
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="ghost" onClick={() => setDeleteConfirmUser(null)}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button size="sm" variant="danger" onClick={confirmDelete}>
              {isBn ? 'নিশ্চিতভাবে মুছুন' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
