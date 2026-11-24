import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles, BookCheck, ShieldCheck, Users } from 'lucide-react';
import { ToastContainer } from '../components/ToastContainer';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Header */}
        <Link to="/" className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
            EduFlow LMS
          </span>
        </Link>
        <p className="text-sm text-slate-500">
          Professional Learning Management & Academic Administration Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100">
          <Outlet />
        </div>

        {/* Quick Demo Credentials Footer */}
        <div className="mt-6 p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-slate-600">
          <p className="font-semibold text-blue-900 mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Quick Demo Credentials:
          </p>
          <div className="space-y-1 text-[11px]">
            <p><strong>Admin:</strong> admin@lms.com / admin123</p>
            <p><strong>Teacher:</strong> sarah.jenkins@lms.com / teacher123</p>
            <p><strong>Student:</strong> alex.turner@lms.com / student123</p>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
