import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { User, Mail, Phone, MapPin, Lock, Shield, CheckCircle2, Save } from 'lucide-react';
import { getRoleBadge } from '../../utils/helpers';

export const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useNotifications();

  // Profile fields state
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  });

  // Sync formData whenever user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  // Password fields state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(formData);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast('New passwords do not match', 'warning');
      return;
    }
    setChangingPass(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      showToast('Password changed successfully!', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Password update failed', 'error');
    } finally {
      setChangingPass(false);
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal information, security credentials, and platform preferences
        </p>
      </div>

      {/* Profile Card Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-5">
        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0284c7&color=fff`}
          alt={user?.name}
          className="w-20 h-20 rounded-2xl object-cover ring-4 ring-blue-50 shadow-md"
        />
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <span className={`inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${roleInfo.color} w-fit mx-auto sm:mx-0`}>
              {roleInfo.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          <p className="text-xs text-slate-600 mt-2 max-w-xl">{user?.bio || 'No bio provided yet.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Update Personal Information */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Personal Information</span>
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="+1 (555) 012-3456"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="City, State"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar Image URL</label>
              <input
                type="text"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Short Bio</label>
              <textarea
                rows={2}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-600" />
            <span>Security & Password</span>
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="p-3 rounded-xl bg-purple-50 text-purple-800 text-[11px] leading-relaxed">
              Use a strong combination of uppercase letters, numbers, and symbols to ensure your account security.
            </div>

            <button
              type="submit"
              disabled={changingPass}
              className="w-full py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {changingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
