import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  FileText,
  HelpCircle,
  CalendarCheck,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { getRoleBadge } from '../utils/helpers';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'teacher', 'student']
    },
    {
      label: 'Students',
      path: '/students',
      icon: Users,
      roles: ['admin', 'teacher']
    },
    {
      label: 'Teachers',
      path: '/teachers',
      icon: GraduationCap,
      roles: ['admin']
    },
    {
      label: 'Courses',
      path: '/courses',
      icon: BookOpen,
      roles: ['admin', 'teacher', 'student']
    },
    {
      label: 'Enrollments',
      path: '/enrollments',
      icon: UserCheck,
      roles: ['admin', 'teacher', 'student']
    },
    {
      label: 'Assignments',
      path: '/assignments',
      icon: FileText,
      roles: ['admin', 'teacher', 'student']
    },
    {
      label: 'Quizzes',
      path: '/quizzes',
      icon: HelpCircle,
      roles: ['admin', 'teacher', 'student']
    },
    {
      label: 'Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      roles: ['admin', 'teacher', 'student']
    },
    {
      label: 'Reports & Analytics',
      path: '/reports',
      icon: BarChart3,
      roles: ['admin', 'teacher']
    },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: Bell,
      roles: ['admin', 'teacher', 'student']
    },
    {
      label: 'Profile & Settings',
      path: '/profile',
      icon: Settings,
      roles: ['admin', 'teacher', 'student']
    }
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const roleInfo = getRoleBadge(user?.role);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100 bg-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                EduFlow
              </span>
              <span className="ml-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
                LMS
              </span>
            </div>
          </div>

          {/* User Badge Info Bar */}
          <div className="px-5 py-3.5 mx-3 mt-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0284c7&color=fff`}
                alt={user?.name}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-white shadow-sm flex-shrink-0"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                <span className={`inline-block text-[10px] font-medium px-2 py-0.2 rounded-full border ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-4 space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform opacity-0 group-hover:opacity-100 ${
                          isActive ? 'opacity-100 text-white/80' : 'text-slate-400'
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Logout Button */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
