import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Edit3,
  Briefcase,
  X,
  Save,
  CheckCircle2,
  Calendar,
  Layers,
  Radio,
  Loader2,
  ExternalLink,
  Camera,
  UploadCloud,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { FIXED_SUPER_ADMIN_ID } from '../data/mockUsers';
import { trackDeviceLocation, TrackedLocationResult } from '../utils/deviceLocation';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

export const ProfileSection: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const toast = useToast();
  const { isBn } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [trackedGps, setTrackedGps] = useState<TrackedLocationResult | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    values: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      position: user?.position || '',
      avatar: user?.avatar || '',
      newPassword: '',
    },
  });

  const currentAvatar = watch('avatar') || user?.avatar || AVATAR_PRESETS[0];

  // Process file upload from device
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.warning('Please select a valid image file (PNG, JPG, JPEG, WEBP).', 'Invalid File');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.warning('Image size is too large (max 8MB). Please choose a smaller photo.', 'File Too Large');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setValue('avatar', result);
        updateProfile({ avatar: result });
        setIsUploadingPhoto(false);
        toast.success('Profile picture updated successfully from your device!', 'Photo Uploaded');
      }
    };
    reader.onerror = () => {
      setIsUploadingPhoto(false);
      toast.warning('Could not read image file from your device.', 'Upload Error');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Reset value so same file can be re-selected if needed
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleSelectPreset = (url: string) => {
    setValue('avatar', url);
    updateProfile({ avatar: url });
    toast.success('Avatar preset applied to profile!', 'Avatar Changed');
  };

  const handleResetAvatar = () => {
    const defaultAvatar = AVATAR_PRESETS[0];
    setValue('avatar', defaultAvatar);
    updateProfile({ avatar: defaultAvatar });
    toast.info('Avatar reset to default.', 'Avatar Reset');
  };

  const handleTrackCurrentLocation = async () => {
    setIsTrackingLocation(true);
    try {
      const result = await trackDeviceLocation();
      setTrackedGps(result);
      setValue('address', result.formattedAddress);
      setIsTrackingLocation(false);
      toast.success(
        `Device location locked: ${result.shortAddress} (Accuracy ±${result.coords.accuracy}m)`,
        'GPS Location Detected'
      );
    } catch (err: any) {
      setIsTrackingLocation(false);
      toast.warning(err?.message || 'Could not track device location.', 'GPS Notice');
    }
  };

  const onSubmit = async (data: any) => {
    await new Promise((r) => setTimeout(r, 400));

    updateProfile({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      position: data.position.trim(),
      avatar: data.avatar.trim() || user?.avatar,
    });

    setIsEditing(false);
    toast.success('Your profile details have been successfully updated.', 'Profile Saved');
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const isRootSuperAdmin = user?.id === FIXED_SUPER_ADMIN_ID;

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword) {
      setPasswordError(isBn ? 'অনুগ্রহ করে কারেন্ট পাসওয়ার্ড প্রদান করুন।' : 'Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError(isBn ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(isBn ? 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মেলেনি।' : 'New password and confirm password do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success(
          isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' : 'Password updated successfully!',
          isBn ? 'পাসওয়ার্ড আপডেট' : 'Password Changed'
        );
        setTimeout(() => setPasswordSuccess(false), 5000);
      } else {
        setPasswordError(res.error || (isBn ? 'পাসওয়ার্ড পরিবর্তনে ব্যর্থ হয়েছে।' : 'Failed to update password.'));
      }
    } catch (err: any) {
      setPasswordError(err?.message || 'Error changing password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Top Header with Edit Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isBn ? 'অ্যাকাউন্ট ও প্রোফাইল সেটিংস' : 'Account & Profile Settings'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn
              ? 'আপনার পরিচয়, ঠিকানার যোগাযোগের তথ্য এবং সুরক্ষা তথ্য দেখুন ও পরিবর্তন করুন'
              : 'View and manage your identity, premises contacts, and security credentials'}
          </p>
        </div>

        <div>
          {!isEditing ? (
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit3 className="w-4 h-4" />}
            >
              {isBn ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile'}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              leftIcon={<X className="w-4 h-4" />}
            >
              {isBn ? 'সম্পাদনা বাতিল' : 'Cancel Edit'}
            </Button>
          )}
        </div>
      </div>

      {/* Hidden Native File Input for Device Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Profile Presentation / Edit Card */}
      <Card className="p-6">
        {/* User Identity Header with Device Upload Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer rounded-2xl transition-all duration-200 ${
                isDragOver
                  ? 'ring-4 ring-emerald-500 ring-offset-2 scale-105'
                  : 'hover:opacity-95'
              }`}
              title="Click or drag & drop to upload profile picture from your device"
            >
              <img
                src={currentAvatar}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                }}
                referrerPolicy="no-referrer"
                alt="Avatar"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-md transition-transform"
              />

              {/* Upload Hover Overlay */}
              <div className="absolute inset-0 rounded-2xl bg-black/55 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity backdrop-blur-xs p-1">
                <Camera className="w-5 h-5 text-white animate-bounce" />
                <span className="text-[10px] font-bold text-center leading-tight">
                  {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                </span>
              </div>

              {isRootSuperAdmin && (
                <span
                  className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 shadow-sm ring-2 ring-white dark:ring-slate-900"
                  title="Root Administrator"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              )}

              {isUploadingPhoto && (
                <div className="absolute inset-0 rounded-2xl bg-slate-900/80 flex items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                </div>
              )}
            </div>

            {/* Quick Upload Buttons beneath Avatar */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors cursor-pointer"
                title="Upload image from phone or computer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Device Upload</span>
              </button>

              <button
                type="button"
                onClick={handleResetAvatar}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset to default avatar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {user?.name}
              </h3>
              <Badge
                variant={
                  user?.role === 'super_admin'
                    ? 'critical'
                    : user?.role === 'admin'
                    ? 'info'
                    : 'neutral'
                }
                size="sm"
              >
                {user?.role.replace('_', ' ')}
              </Badge>
              {isRootSuperAdmin && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Fixed Root
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {user?.email}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-0.5 justify-center sm:justify-start text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Status: Active
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                {user?.metersCount || 1} Linked Meter(s)
              </span>
            </div>

            {/* Quick Avatar Presets Tray */}
            <div className="pt-2 flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-[11px] text-slate-400 font-medium">Quick presets:</span>
              <div className="flex items-center gap-1.5">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`w-6 h-6 rounded-full overflow-hidden border transition-all cursor-pointer ${
                      currentAvatar === preset
                        ? 'border-emerald-500 ring-2 ring-emerald-500/40 scale-110'
                        : 'border-slate-300 dark:border-slate-700 hover:scale-105'
                    }`}
                    title={`Apply avatar preset ${idx + 1}`}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* VIEW MODE: Clean, high-fidelity profile overview */}
        {!isEditing ? (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Full Customer / Staff Name
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {user?.name || 'N/A'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Designation / Role
                </span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {user?.position || (user?.role.replace('_', ' ') + ' Officer')}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Contact Phone (SMS Alerts)
                </span>
                <p className="text-sm font-mono text-slate-800 dark:text-slate-200">
                  {user?.phone || '+880 1711-000000'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Official Email Address
                </span>
                <p className="text-sm font-mono text-slate-800 dark:text-slate-200">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Registered Premise Address
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-200">
                {user?.address || 'DESCO Headquarters, Nikunja-2, Dhaka'}
              </p>
            </div>
          </div>
        ) : (
          /* EDIT MODE: Form with input fields and save triggers */
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
              <span>Editing Profile Details. Click <strong>Save Changes</strong> when completed.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-rose-500 mt-1">{String(errors.name.message)}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Position / Designation
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    {...register('position')}
                    type="text"
                    placeholder="e.g. Chief Director / Property Owner"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    {...register('email', { required: 'Email address is required' })}
                    type="email"
                    placeholder="officer@desco.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1">{String(errors.email.message)}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SMS Notification Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    {...register('phone')}
                    type="tel"
                    placeholder="+880 1711-xxxxxx"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Premises Physical Address
                </label>
                <button
                  type="button"
                  onClick={handleTrackCurrentLocation}
                  disabled={isTrackingLocation}
                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 flex items-center gap-1.5 cursor-pointer bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-800 transition-all"
                  title="Track real-time current physical location of this device"
                >
                  {isTrackingLocation ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                      <span>Tracking GPS...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                      <span>Track Device GPS</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  {...register('address')}
                  type="text"
                  placeholder="House, Road, Area, Dhaka"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {trackedGps && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      GPS: {trackedGps.coords.latitude.toFixed(4)}°, {trackedGps.coords.longitude.toFixed(4)}° (±{trackedGps.coords.accuracy}m)
                    </span>
                  </div>
                  <a
                    href={trackedGps.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Avatar & Photo Upload Controls */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Profile Photo & Avatar
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Upload directly from your device storage or pick a preset
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload from Device</span>
                </button>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                  isDragOver
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={currentAvatar}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                    }}
                    referrerPolicy="no-referrer"
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Drag & drop your photo here, or <span className="text-emerald-600 dark:text-emerald-400 underline">browse device</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Supports JPG, PNG, WEBP up to 8MB • Instant local storage sync
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Or Image Web URL (Optional)
                </label>
                <input
                  {...register('avatar')}
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting} leftIcon={<Save className="w-4 h-4" />}>
                {isBn ? 'প্রোফাইল পরিবর্তন সংরক্ষণ' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Dedicated Password Change Section with 3 fields */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'পাসওয়ার্ড পরিবর্তন (Password Change)' : 'Password Change & Security'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBn
                  ? 'কারেন্ট পাসওয়ার্ড, নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড প্রদান করে পাসওয়ার্ড আপডেট করুন'
                  : 'Update your account password securely using current and new credentials'}
              </p>
            </div>
          </div>
          <Badge variant="outline" size="sm" className="border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
            {isBn ? 'সুরক্ষিত ডেটাবেজ' : 'Encrypted Database'}
          </Badge>
        </div>

        <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Field 1: Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'কারেন্ট পাসওয়ার্ড *' : 'Current Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={isBn ? 'বর্তমান পাসওয়ার্ড দিন' : 'Enter current password'}
                  required
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {isBn ? 'প্রাথমিক ডিফল্ট: 123456' : 'Default initial: 123456'}
              </p>
            </div>

            {/* Field 2: New Password / Change Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'চেঞ্জ পাসওয়ার্ড *' : 'New / Change Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={isBn ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'New password (min 6 chars)'}
                  required
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {isBn ? 'কমপক্ষে ৬টি অক্ষর বা সংখ্যা' : 'Minimum 6 characters'}
              </p>
            </div>

            {/* Field 3: Confirm Change Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'কনফার্ম চেঞ্জ পাসওয়ার্ড *' : 'Confirm Change Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isBn ? 'নতুন পাসওয়ার্ড পুনরায় লিখুন' : 'Re-type new password'}
                  required
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {isBn ? 'নতুন পাসওয়ার্ডের সাথে হুবহু মিলতে হবে' : 'Must match new password'}
              </p>
            </div>
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 font-medium">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                {isBn
                  ? 'আপনার পাসওয়ার্ড ডেটাবেজে সফলভাবে আপডেট করা হয়েছে! পরবর্তী লগইনে এই নতুন পাসওয়ার্ড কার্যকর হবে।'
                  : 'Your password has been successfully updated in database! Use this new password for next logins.'}
              </span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isUpdatingPassword}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              {isBn ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
