import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/StatCard';
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  TrendingUp,
  Clock,
  Calendar,
  Award,
  CheckCircle2,
  FileText,
  AlertCircle,
  ArrowRight,
  BookMarked
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatDate, getStatusBadge } from '../../utils/helpers';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/stats');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <span className="w-9 h-9 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-sm font-medium text-slate-500">Loading dashboard analytics...</span>
      </div>
    );
  }

  // 1. ADMIN DASHBOARD VIEW
  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-blue-500/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-100 mb-2">
              <span>Academic Administration Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-sm text-blue-100 mt-1">
              Here is an overview of platform performance, student enrollments, and academic metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/courses"
              className="px-4 py-2.5 bg-white text-blue-700 text-xs font-semibold rounded-xl hover:bg-blue-50 shadow-sm transition-all"
            >
              Manage Courses
            </Link>
            <Link
              to="/reports"
              className="px-4 py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all"
            >
              Full Reports
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={data?.stats?.totalStudents || 0}
            icon={Users}
            change="+14%"
            color="blue"
          />
          <StatCard
            title="Total Teachers"
            value={data?.stats?.totalTeachers || 0}
            icon={GraduationCap}
            change="+4%"
            color="purple"
          />
          <StatCard
            title="Total Courses"
            value={data?.stats?.totalCourses || 0}
            icon={BookOpen}
            change="+8%"
            color="emerald"
          />
          <StatCard
            title="Total Enrollments"
            value={data?.stats?.totalEnrollments || 0}
            icon={UserCheck}
            change="+22%"
            color="indigo"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enrollment Trends Line/Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Student Enrollment Analytics</h3>
                <p className="text-xs text-slate-400">Monthly student registration and course growth</p>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                +24% this semester
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyTrends || []}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Pie Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Course Categories</h3>
              <p className="text-xs text-slate-400">Student enrollment distribution by field</p>
            </div>

            <div className="h-60 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.categoryDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(data?.categoryDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {(data?.categoryDistribution || []).slice(0, 4).map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-600 truncate">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Lists Row: Recent Students & Recent Enrollments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Registrations */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Recent Student Registrations</h3>
              <Link to="/students" className="text-xs font-semibold text-blue-600 hover:underline">
                View All →
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {data?.recentStudents && data.recentStudents.length > 0 ? (
                data.recentStudents.map((s) => (
                  <div key={s._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=0284c7&color=fff`}
                        alt={s.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{s.name}</p>
                        <p className="text-[11px] text-slate-400">{s.email}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">{formatDate(s.createdAt)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4">No recent students found.</p>
              )}
            </div>
          </div>

          {/* Recent Enrollments */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Recent Course Enrollments</h3>
              <Link to="/enrollments" className="text-xs font-semibold text-blue-600 hover:underline">
                View All →
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {data?.recentEnrollments && data.recentEnrollments.length > 0 ? (
                data.recentEnrollments.map((e) => (
                  <div key={e._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {e.course?.code?.slice(0, 2) || 'CS'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{e.course?.title}</p>
                        <p className="text-[11px] text-slate-400">{e.student?.name}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Enrolled
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4">No enrollments yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. TEACHER DASHBOARD VIEW
  if (user?.role === 'teacher') {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-blue-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-100 mb-2">
              Instructor Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name}
            </h1>
            <p className="text-sm text-blue-100 mt-1">
              Manage your assigned courses, review student assignment submissions, and track lesson progress.
            </p>
          </div>
          <Link
            to="/courses"
            className="px-4 py-2.5 bg-white text-blue-700 text-xs font-semibold rounded-xl hover:bg-blue-50 shadow-sm transition-all"
          >
            Create / View Courses
          </Link>
        </div>

        {/* Teacher Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Courses"
            value={data?.stats?.myCoursesCount || 0}
            icon={BookOpen}
            color="blue"
          />
          <StatCard
            title="Total Students Enrolled"
            value={data?.stats?.totalStudents || 0}
            icon={Users}
            color="emerald"
          />
          <StatCard
            title="Assignments Created"
            value={data?.stats?.totalAssignments || 0}
            icon={FileText}
            color="purple"
          />
          <StatCard
            title="Pending Submissions"
            value={data?.stats?.pendingGrading || 0}
            icon={AlertCircle}
            color="amber"
          />
        </div>

        {/* Charts & Submissions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-1">Course Enrollment Breakdown</h3>
            <p className="text-xs text-slate-400 mb-6">Students enrolled per course</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.courseStudentsData || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="students" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Submissions to Grade */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-800">Recent Submissions</h3>
                <Link to="/assignments" className="text-xs font-semibold text-blue-600 hover:underline">
                  View All →
                </Link>
              </div>

              <div className="divide-y divide-slate-50">
                {data?.recentSubmissions && data.recentSubmissions.length > 0 ? (
                  data.recentSubmissions.map((sub) => (
                    <div key={sub._id} className="py-3">
                      <p className="text-xs font-semibold text-slate-800 truncate">{sub.assignment?.title}</p>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                        <span>{sub.student?.name}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${sub.status === 'graded' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No pending submissions.</p>
                )}
              </div>
            </div>

            <Link
              to="/assignments"
              className="mt-4 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl text-center transition-colors"
            >
              Go to Assignment Review Room
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. STUDENT DASHBOARD VIEW
  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-blue-500/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-100 mb-2">
            Student Learning Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hi, {user?.name}!
          </h1>
          <p className="text-sm text-blue-100 mt-1">
            Keep up the great momentum! Review your ongoing courses, complete assignments, and track test scores.
          </p>
        </div>
        <Link
          to="/courses"
          className="px-5 py-2.5 bg-white text-blue-700 text-xs font-semibold rounded-xl hover:bg-blue-50 shadow-sm transition-all"
        >
          Explore Courses
        </Link>
      </div>

      {/* Student Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Courses"
          value={data?.stats?.enrolledCourses || 0}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Active Courses"
          value={data?.stats?.activeCourses || 0}
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Completed Courses"
          value={data?.stats?.completedCourses || 0}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Average Progress"
          value={`${data?.stats?.averageProgress || 0}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Course Progress Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">My Ongoing Courses</h2>
          <Link to="/enrollments" className="text-xs font-semibold text-blue-600 hover:underline">
            View All Enrolled →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.enrollments && data.enrollments.length > 0 ? (
            data.enrollments.map((enr) => (
              <div
                key={enr._id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {enr.course?.code}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {enr.progressPercentage || 0}%
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{enr.course?.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{enr.course?.description}</p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${enr.progressPercentage || 0}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Instructor: <strong className="text-slate-700">{enr.course?.teacher?.name || 'Faculty'}</strong>
                  </span>
                  <Link
                    to={`/courses/${enr.course?._id}`}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 bg-white p-8 rounded-3xl text-center border border-slate-100">
              <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">You are not enrolled in any courses yet</p>
              <Link
                to="/courses"
                className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-md"
              >
                Browse Course Catalog
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Assignments & Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Upcoming Assignments</h3>
            <Link to="/assignments" className="text-xs font-semibold text-blue-600 hover:underline">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {data?.upcomingAssignments && data.upcomingAssignments.length > 0 ? (
              data.upcomingAssignments.map((a) => (
                <div key={a._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{a.title}</p>
                    <p className="text-[11px] text-slate-400">{a.course?.title}</p>
                  </div>
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                    Due {formatDate(a.deadline)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4">No upcoming deadlines.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800">Recent Quiz Results</h3>
            <Link to="/quizzes" className="text-xs font-semibold text-blue-600 hover:underline">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {data?.recentResults && data.recentResults.length > 0 ? (
              data.recentResults.map((r) => (
                <div key={r._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{r.quiz?.title}</p>
                    <p className="text-[11px] text-slate-400">{r.course?.title}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${r.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {r.percentage}% ({r.score}/{r.maxScore})
                    </span>
                    <span className="block text-[10px] text-slate-400">{formatDate(r.completedAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4">No quizzes taken yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
