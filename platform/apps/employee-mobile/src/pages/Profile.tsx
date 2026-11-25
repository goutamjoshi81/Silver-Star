import { useState } from 'react';
import { COMPANY, api } from '@mock/mockData';
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Heart,
  LogOut,
  Key,
  Building,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Shield,
  Check,
} from 'lucide-react';

interface ProfileProps {
  onLogout: () => void;
  currentUser?: any;
  onOpenIntegrations?: () => void;
}

export default function Profile({ onLogout, currentUser, onOpenIntegrations }: ProfileProps) {
  const user = currentUser || {
    name: 'Ramesh Kumar',
    employeeCode: 'SS-10001',
    role: 'Field Employee',
    persona: 'field',
    phone: '+91 98765 43210',
    email: 'info@silverstarindia.net',
    bloodGroup: 'B+',
    siteName: 'Infosys - Electronic City Campus Phase 1',
    designationName: 'Security Guard',
  };

  const initials = (user.name || 'SS')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0].toUpperCase())
    .join('');

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword.trim()) {
      setErrorMsg('Please enter your current password.');
      return;
    }
    if (!newPassword.trim()) {
      setErrorMsg('Please enter a new password.');
      return;
    }
    if (newPassword.trim().length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setErrorMsg('New passwords do not match. Please verify.');
      return;
    }
    if (currentPassword.trim() === newPassword.trim()) {
      setErrorMsg('New password must be different from current password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.changePassword({
        userId: user.id || user.employeeId,
        employeeCode: user.employeeCode,
        username: user.portalUsername || user.username,
        email: user.email,
        persona: user.persona,
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      if (res && res.success) {
        setSuccessMsg(res.message || 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setSuccessMsg('');
        }, 2500);
      } else {
        setErrorMsg('Failed to update password. Please check your credentials.');
      }
    } catch (err: any) {
      console.error('Password change error:', err);
      setErrorMsg(
        err.message ||
          'Unable to update password. Please check your current password or connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="p-3.5 sm:p-4 space-y-4 max-w-md mx-auto">
      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm text-center relative overflow-hidden">
        <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-[#1A2B79] to-[#26BCEE] text-white flex items-center justify-center font-bold text-2xl mx-auto mb-2.5 shadow-md border-2 border-white ring-4 ring-[#1A2B79]/10">
          {initials}
        </div>
        <h3 className="font-black text-base text-slate-900">{user.name}</h3>
        <p className="text-xs text-[#1A2B79] font-bold mt-0.5">
          {user.designationName || user.role}
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 size={11} /> PSARA Certified & Verified
          </span>
        </div>
      </div>

      {/* Account & Assignment Info */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2.5 text-xs">
        <h4 className="font-black text-xs text-slate-900 mb-1">Account & Role Information</h4>

        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-400">Account Type:</span>
          <span className="font-bold text-[#1A2B79] capitalize">
            {user.persona === 'field' && 'Field Staff (Guard / Housekeeping)'}
            {user.persona === 'operations' && 'Operations Management'}
            {user.persona === 'client' && 'Corporate Client Facility Partner'}
          </span>
        </div>

        {user.employeeCode && (
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Employee Code:</span>
            <span className="font-mono font-bold text-slate-900">{user.employeeCode}</span>
          </div>
        )}

        {user.phone && (
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Phone Number:</span>
            <a href={`tel:${user.phone}`} className="font-mono font-semibold text-slate-900 hover:text-[#1A2B79]">
              {user.phone}
            </a>
          </div>
        )}

        {user.email && (
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Email Address:</span>
            <span className="font-semibold text-slate-900">{user.email}</span>
          </div>
        )}

        {user.siteName && (
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400">Assigned Facility:</span>
            <span className="font-semibold text-slate-900 truncate max-w-[200px] text-right">
              {user.siteName}
            </span>
          </div>
        )}

        {user.bloodGroup && (
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Blood Group:</span>
            <span className="font-bold text-rose-600">{user.bloodGroup}</span>
          </div>
        )}
      </div>

      {/* Security & Password Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1A2B79] flex items-center justify-center border border-blue-100">
              <Lock size={16} />
            </div>
            <div>
              <h4 className="font-black text-xs text-slate-900">Security & Credentials</h4>
              <p className="text-[11px] text-slate-400">Protect and manage your account password</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setShowPasswordModal(true);
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-[#1A2B79] to-[#26BCEE] hover:opacity-95 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
        >
          <Key size={14} />
          <span>Change Account Password</span>
        </button>
      </div>

      {/* 3rd-Party Keys Diagnostic Launcher */}
      {onOpenIntegrations && (
        <button
          onClick={onOpenIntegrations}
          className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 flex items-center justify-between transition-colors shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Key size={15} className="text-[#1A2B79]" />
            <span>3rd-Party Integrations & API Keys</span>
          </div>
          <span className="text-[10px] text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
            Configure Keys
          </span>
        </button>
      )}

      {/* Emergency Contact & Helpline */}
      <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <Heart size={14} className="text-rose-500" />
          <span>24/7 Security Control Room</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          In case of field distress, geofence mismatch, or emergency, contact HQ immediately:
        </p>
        <div className="pt-1 flex items-center justify-between text-[11px]">
          <span className="font-mono font-bold text-slate-900">{COMPANY.phone}</span>
          <a
            href={`tel:${COMPANY.phone}`}
            className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 font-bold text-[#1A2B79] rounded-lg shadow-sm"
          >
            Call Desk
          </a>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        <LogOut size={14} />
        <span>Sign Out of Silver Star Mobile</span>
      </button>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 relative animate-in slide-in-from-bottom-5 duration-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1A2B79] flex items-center justify-center border border-blue-100">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">Change Password</h3>
                  <p className="text-[11px] text-slate-400">Update credentials for {user.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetPasswordModal}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-rose-700 text-xs animate-shake">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2 text-emerald-800 text-xs">
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                <span className="font-bold">{successMsg}</span>
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
              {/* Current Password Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing password"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-[#1A2B79] focus:border-transparent outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {user.persona === 'client'
                    ? 'Default client password is your registered contact phone.'
                    : 'Default employee password is Silverstar@123.'}
                </p>
              </div>

              {/* New Password Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    minLength={6}
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-[#1A2B79] focus:border-transparent outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {newPassword.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] mt-1 font-semibold">
                    {newPassword.length >= 6 ? (
                      <span className="text-emerald-600 flex items-center gap-0.5">
                        <Check size={11} /> Meets length requirement
                      </span>
                    ) : (
                      <span className="text-amber-600">
                        {6 - newPassword.length} more character(s) required
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    minLength={6}
                    required
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-slate-900 text-xs focus:ring-2 focus:ring-[#1A2B79] focus:border-transparent outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] mt-1 font-semibold">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-600 flex items-center gap-0.5">
                        <Check size={11} /> Passwords match
                      </span>
                    ) : (
                      <span className="text-rose-600">Passwords do not match</span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetPasswordModal}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !currentPassword.trim() ||
                    newPassword.length < 6 ||
                    newPassword !== confirmPassword
                  }
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#1A2B79] to-[#26BCEE] hover:opacity-95 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Save Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
