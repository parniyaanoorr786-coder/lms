import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { Mail, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: request token, 2: reset with token
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { showToast } = useNotifications();

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setResetToken(res.data.resetToken);
        setStep(2);
        showToast('Reset token generated successfully', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Email not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/auth/reset-password/${resetToken}`, { password: newPassword });
      if (res.data.success) {
        setSuccess(true);
        showToast('Password reset successfully! You can now log in.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Password reset failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Reset your password</h2>
        <p className="text-xs text-slate-500 mt-1">
          {step === 1
            ? 'Enter your registered email to receive a recovery token'
            : 'Set your new secure password'}
        </p>
      </div>

      {success ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">Password Changed!</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Your account password has been updated. You can now log in with your new credentials.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            Go to Login
          </Link>
        </div>
      ) : step === 1 ? (
        <form onSubmit={handleRequestToken} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Generate Reset Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reset Token</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Confirm New Password</span>
            )}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-xs text-slate-500">
        Remembered your password?{' '}
        <Link to="/login" className="font-semibold text-blue-600 hover:underline">
          Return to Sign In
        </Link>
      </div>
    </div>
  );
};
