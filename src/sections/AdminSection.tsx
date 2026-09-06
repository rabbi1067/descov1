import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  UserCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
  UserX,
  ArrowRightLeft,
  Crown,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { mockUsers, FIXED_SUPER_ADMIN_ID } from '../data/mockUsers';
import { User } from '../types';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export const AdminSection: React.FC = () => {
  const { user: currentUser, transferSuperAdmin } = useAuth();
  const toast = useToast();
  const { language, isBn } = useLanguage();

  // Helper to load effective super admin
  const getSuperAdminFromStorage = (): User => {
    try {
      const customStr = localStorage.getItem('desco_custom_super_admin');
      if (customStr) return JSON.parse(customStr);
    } catch {
      // ignore
    }
    return mockUsers.find((u) => u.role === 'super_admin') || mockUsers[2];
  };

  const [admins, setAdmins] = useState<User[]>(() => {
    const effectiveSA = getSuperAdminFromStorage();
    const opsAdmins = mockUsers
      .filter((u) => u.role === 'admin')
      .map((a) => ({
        ...a,
        position: a.position || 'Operations Officer',
      }));
    return [
      {
        ...effectiveSA,
        position: effectiveSA.position || 'Chief Operations & Grid Director',
      },
      ...opsAdmins,
    ];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState('Operations Officer');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Super Admin Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferMode, setTransferMode] = useState<'existing' | 'new'>('new');
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [transferForm, setTransferForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'Chief Operations & Grid Director',
  });

  const superAdmin = admins.find((a) => a.role === 'super_admin') || admins[0];
  const regularAdmins = admins.filter((a) => a.role === 'admin');

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;

    const newAdm: User = {
      id: `usr-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      role: 'admin',
      position: newPosition.trim() || 'Operations Officer',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
      metersCount: 0,
    };

    setAdmins((prev) => [...prev, newAdm]);
    setShowAddForm(false);
    setNewEmail('');
    setNewName('');
    setNewPosition('Operations Officer');
    setNewPassword('');
    toast.success(
      `Successfully provisioned administrator account for ${newEmail} (${newPosition})`,
      'Admin Provisioned'
    );
  };

  const toggleAdminStatus = (id: string) => {
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id === id && a.role !== 'super_admin') {
          const nextStatus = a.status === 'active' ? 'suspended' : 'active';
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
    toast.info('Administrator status has been updated.', 'Access Status');
  };

  const openTransferModal = () => {
    setTransferForm({
      name: superAdmin?.name || '',
      email: superAdmin?.email || '',
      phone: superAdmin?.phone || '+880 1711-000000',
      position: superAdmin?.position || 'Chief Operations & Grid Director',
    });
    if (regularAdmins.length > 0) {
      setSelectedAdminId(regularAdmins[0].id);
    }
    setShowTransferModal(true);
  };

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();

    let targetName = '';
    let targetEmail = '';
    let targetPhone = '';
    let targetPosition = '';

    if (transferMode === 'existing') {
      const chosen = regularAdmins.find((a) => a.id === selectedAdminId);
      if (!chosen) {
        toast.error('Please select an existing Operations Officer.', 'Invalid Selection');
        return;
      }
      targetName = chosen.name;
      targetEmail = chosen.email;
      targetPhone = chosen.phone || '+880 1711-000000';
      targetPosition = 'Chief Operations & Grid Director';
    } else {
      if (!transferForm.name.trim() || !transferForm.email.trim()) {
        toast.error('Name and Email are required.', 'Missing Fields');
        return;
      }
      targetName = transferForm.name.trim();
      targetEmail = transferForm.email.trim().toLowerCase();
      targetPhone = transferForm.phone.trim();
      targetPosition = transferForm.position.trim() || 'Chief Operations & Grid Director';
    }

    // Execute via AuthContext
    transferSuperAdmin({
      name: targetName,
      email: targetEmail,
      phone: targetPhone,
      position: targetPosition,
    });

    // Update local table immediately
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.role === 'super_admin') {
          return {
            ...a,
            name: targetName,
            email: targetEmail,
            phone: targetPhone,
            position: targetPosition,
          };
        }
        return a;
      })
    );

    setShowTransferModal(false);
    toast.success(
      `Root Super Admin successfully changed to ${targetName} (${targetEmail}). You can change or transfer again anytime.`,
      'Super Admin Changed'
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isBn ? 'সিস্টেম অ্যাডমিনিস্ট্রেটর গভর্নেন্স' : 'System Administrator Governance'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'প্রশাসনিক অনুমতি পরিচালনা করুন, অপারেশন অফিসার যুক্ত করুন এবং মূল সুপার অ্যাডমিন মালিকানা নির্ধারণ করুন'
              : 'Manage administrative privileges, provision operations officers, and configure Root Super Admin ownership'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="md"
            variant="outline"
            onClick={openTransferModal}
            leftIcon={<ArrowRightLeft className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
            className="border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
          >
            {isBn ? 'সুপার অ্যাডমিন পরিবর্তন' : 'Change Super Admin'}
          </Button>

          <Button
            size="md"
            variant="primary"
            onClick={() => setShowAddForm(!showAddForm)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {isBn ? 'অ্যাডমিন যোগ করুন' : 'Provision Administrator'}
          </Button>
        </div>
      </div>

      {/* Super Admin Status Card */}
      <Card className="p-5 border-2 border-purple-500/20 bg-gradient-to-br from-purple-50/60 via-white to-slate-50 dark:from-purple-950/20 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isBn ? 'মূল সুপার অ্যাডমিনিস্ট্রেটর (মাস্টার অ্যাকাউন্ট)' : 'Root Super Administrator (Master Account)'}
                </h3>
                <Badge variant="critical" size="sm">
                  {isBn ? 'সক্রিয় মাস্টার' : 'Active Master'}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {isBn ? 'বর্তমান মালিক: ' : 'Current Owner: '}
                <strong className="text-slate-900 dark:text-slate-100">
                  {superAdmin?.name}
                </strong>{' '}
                (<span className="font-mono">{superAdmin?.email}</span>)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isBn
                  ? `পদবী: ${superAdmin?.position || 'Chief Operations & Grid Director'} • আপনি যে কোনো সময় এই অ্যাকাউন্ট পরিবর্তন বা হস্তান্তর করতে পারেন।`
                  : `Designation: ${superAdmin?.position || 'Chief Operations & Grid Director'} • You have full option to change, rename, or transfer this account anytime.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              size="sm"
              variant="primary"
              onClick={openTransferModal}
              leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isBn ? 'মালিকানা হস্তান্তর' : 'Transfer Ownership'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Add Admin Drawer/Card */}
      {showAddForm && (
        <Card className="p-5 border-2 border-purple-500/30">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-purple-600" />{' '}
            {isBn ? 'নতুন অ্যাডমিন পরিচয় তৈরি করুন (ডেসকো অপারেশন)' : 'Create New Admin Identity (DESCO Operations)'}
          </h3>
          <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'আইনি পূর্ণ নাম *' : 'Full Legal Name *'}
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Farhan Chowdhury"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'ডেসকো কর্মী ইমেইল *' : 'DESCO Staff Email *'}
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="officer@desco.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'পদবী / অবস্থান *' : 'Designation / Position *'}
              </label>
              <input
                type="text"
                required
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                placeholder="e.g. Operations Officer / Billing Supervisor"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'প্রাথমিক পাসওয়ার্ড *' : 'Initial Password *'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-9 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button size="sm" variant="outline" type="button" onClick={() => setShowAddForm(false)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button size="sm" variant="primary" type="submit" className="bg-purple-600 hover:bg-purple-700">
                {isBn ? 'অ্যাডমিন অনুমতি প্রদান করুন' : 'Grant Administrator Access'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Admin List Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-semibold">
              <th className="py-3 px-4">{isBn ? 'অ্যাডমিন কর্মকর্তা' : 'Admin Officer'}</th>
              <th className="py-3 px-4">{isBn ? 'পদবী / অবস্থান' : 'Designation / Position'}</th>
              <th className="py-3 px-4">{isBn ? 'ক্লিয়ারেন্স ভূমিকা' : 'Clearance Role'}</th>
              <th className="py-3 px-4">{isBn ? 'অবস্থা' : 'Status'}</th>
              <th className="py-3 px-4 text-right">{isBn ? 'পদক্ষেপ' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {admins.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={a.avatar}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                      }}
                      referrerPolicy="no-referrer"
                      alt={a.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{a.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{a.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                  {a.position || (a.role === 'super_admin' ? 'Chief Operations & Grid Director' : 'Operations Officer')}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={a.role === 'super_admin' ? 'critical' : 'info'} size="sm">
                    {a.role === 'super_admin'
                      ? isBn
                        ? 'মূল সুপার অ্যাডমিন'
                        : 'Root Super Administrator'
                      : isBn
                      ? 'অপারেশনস অ্যাডমিন'
                      : 'Operations Admin'}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      a.status === 'active'
                        ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60'
                        : 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60'
                    }`}
                  >
                    {a.status === 'active' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> {isBn ? 'সক্রিয় ক্লিয়ারেন্স' : 'Active Clearance'}
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3 h-3" /> {isBn ? 'স্থগিত' : 'Suspended'}
                      </>
                    )}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {a.role === 'super_admin' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={openTransferModal}
                      leftIcon={<ArrowRightLeft className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                      className="border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                    >
                      {isBn ? 'সুপার অ্যাডমিন পরিবর্তন' : 'Change Super Admin'}
                    </Button>
                  ) : (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant={a.status === 'active' ? 'outline' : 'primary'}
                        onClick={() => toggleAdminStatus(a.id)}
                      >
                        {a.status === 'active' ? (isBn ? 'স্থগিত' : 'Suspend') : isBn ? 'সক্রিয়' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setAdmins(admins.filter((item) => item.id !== a.id))}
                        className="text-rose-600 hover:text-rose-700"
                      >
                        {isBn ? 'বাতিল' : 'Revoke'}
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Super Admin Change / Transfer Modal */}
      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title={isBn ? 'মূল সুপার অ্যাডমিন পরিবর্তন / হস্তান্তর' : 'Change / Transfer Root Super Admin'}
        description={
          isBn
            ? 'মাস্টার অ্যাডমিন মালিকানা পুনরায় নির্ধারণ করুন, নতুন পরিচালক নিয়োগ করুন অথবা বিদ্যমান অফিসারকে পদোন্নতি দিন।'
            : 'Reassign master administrator ownership, appoint a new director, or promote an existing operations officer.'
        }
      >
        <form onSubmit={handleExecuteTransfer} className="space-y-4 pt-1">
          {/* Transfer Mode Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setTransferMode('new')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                transferMode === 'new'
                  ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isBn ? 'নতুন ব্যক্তি নিয়োগ' : 'Appoint New Person'}
            </button>
            <button
              type="button"
              onClick={() => setTransferMode('existing')}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                transferMode === 'existing'
                  ? 'bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {isBn ? 'বিদ্যমান অ্যাডমিন পদোন্নতি' : 'Promote Existing Admin'}
            </button>
          </div>

          {transferMode === 'existing' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {isBn
                  ? 'মূল সুপার অ্যাডমিনে পদোন্নতির জন্য অপারেশন্স অ্যাডমিন নির্বাচন করুন *'
                  : 'Select Operations Admin to Promote to Root Super Admin *'}
              </label>
              {regularAdmins.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">
                  {isBn
                    ? 'অন্য কোন অ্যাডমিন পাওয়া যায়নি। দয়া করে উপরে "নতুন ব্যক্তি নিয়োগ" বেছে নিন।'
                    : 'No other admin accounts found. Please choose "Appoint New Person" above.'}
                </p>
              ) : (
                <select
                  value={selectedAdminId}
                  onChange={(e) => setSelectedAdminId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {regularAdmins.map((adm) => (
                    <option key={adm.id} value={adm.id}>
                      {adm.name} ({adm.email}) — {adm.position}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'পূর্ণ আইনি নাম *' : 'Full Legal Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={transferForm.name}
                  onChange={(e) => setTransferForm({ ...transferForm, name: e.target.value })}
                  placeholder="e.g. Fazle Rabbi / Md. Karim"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {isBn ? 'অফিসিয়াল ইমেইল ঠিকানা *' : 'Staff / Official Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  value={transferForm.email}
                  onChange={(e) => setTransferForm({ ...transferForm, email: e.target.value })}
                  placeholder="e.g. director@desco.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'পদবী / শিরোনাম' : 'Designation / Title'}
                  </label>
                  <input
                    type="text"
                    value={transferForm.position}
                    onChange={(e) => setTransferForm({ ...transferForm, position: e.target.value })}
                    placeholder="Chief Operations & Grid Director"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isBn ? 'জরুরি যোগাযোগ ফোন' : 'Emergency Phone'}
                  </label>
                  <input
                    type="tel"
                    value={transferForm.phone}
                    onChange={(e) => setTransferForm({ ...transferForm, phone: e.target.value })}
                    placeholder="+880 1711-xxxxxx"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notice & Warning */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              {isBn
                ? 'সুপার অ্যাডমিন হস্তান্তর অবিলম্বে উল্লিখিত তথ্যে সিস্টেমের মালিকানা আপডেট করবে। আপনি প্রয়োজনে যেকোনো সময় আবার পরিবর্তন করতে পারেন।'
                : 'Transferring Super Admin updates the system ownership to the specified credentials immediately. You can re-assign or transfer again whenever needed.'}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button size="sm" variant="ghost" type="button" onClick={() => setShowTransferModal(false)}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              size="sm"
              variant="primary"
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              {isBn ? 'সুপার অ্যাডমিন হস্তান্তর নিশ্চিত করুন' : 'Confirm Super Admin Transfer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

