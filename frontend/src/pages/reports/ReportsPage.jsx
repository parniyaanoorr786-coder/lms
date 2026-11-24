import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  Users,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const ReportsPage = () => {
  const { showToast } = useNotifications();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports/analytics');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to load system analytics', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [showToast]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <span className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block" />
        <p className="text-xs text-slate-400 mt-2 font-medium">Generating performance reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Deep-dive into student completion rates, academic performance metrics, and course enrollment growth
        </p>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Enrollments</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{data?.overview?.totalEnrollments || 0}</p>
          <span className="text-xs font-semibold text-emerald-600 mt-1 block">Active Academic Year</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Course Completion Rate</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{data?.overview?.completionRate || 0}%</p>
          <span className="text-xs font-semibold text-blue-600 mt-1 block">Above Benchmark</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Quiz Pass Rate</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{data?.overview?.quizPassRate || 0}%</p>
          <span className="text-xs font-semibold text-emerald-600 mt-1 block">Passing Score &gt; 60%</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400">Homework Grading Rate</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{data?.overview?.gradingRate || 0}%</p>
          <span className="text-xs font-semibold text-purple-600 mt-1 block">Reviewed by Faculty</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Enrollment Growth Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Enrollment Trend</h3>
              <p className="text-xs text-slate-400">Student enrollment volume across recent months</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.enrollmentTrends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="enrollments" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enrollments by Subject Category</h3>
              <p className="text-xs text-slate-400">Distribution of students across major fields</p>
            </div>
            <BarChart3 className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.categoryStats || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="enrolledStudents" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Courses Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Top Performing Courses</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Course Code & Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3 text-right">Enrolled Students</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.topCourses && data.topCourses.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3.5 font-semibold text-slate-800">
                    <span className="font-mono text-blue-600 mr-2">[{c.code}]</span>
                    {c.title}
                  </td>
                  <td className="px-4 py-3.5">{c.category}</td>
                  <td className="px-4 py-3.5">{c.level}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900">{c.enrolledCount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
