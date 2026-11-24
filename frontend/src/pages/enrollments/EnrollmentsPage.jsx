import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { UserCheck, Plus, Trash2, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { formatDate, getStatusBadge } from '../../utils/helpers';

export const EnrollmentsPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = user?.role === 'student' ? '/enrollments/my' : '/enrollments';
      const res = await api.get(endpoint, {
        params: { search: searchTerm, status: statusFilter }
      });
      if (res.data.success) {
        setEnrollments(res.data.enrollments);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load enrollments', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.role, searchTerm, statusFilter, showToast]);

  const fetchDropdownData = async () => {
    if (user?.role === 'admin' || user?.role === 'teacher') {
      try {
        const [cRes, sRes] = await Promise.all([
          api.get('/courses?limit=100'),
          api.get('/students?limit=100')
        ]);
        if (cRes.data.success) setCourses(cRes.data.courses);
        if (sRes.data.success) setStudents(sRes.data.students);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchEnrollments();
    fetchDropdownData();
  }, [fetchEnrollments]);

  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/enrollments', {
        courseId: selectedCourseId,
        studentId: selectedStudentId || undefined
      });
      if (res.data.success) {
        showToast('Enrolled successfully!', 'success');
        setIsEnrollModalOpen(false);
        fetchEnrollments();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Enrollment failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrop = async (enrollmentId) => {
    try {
      const res = await api.delete(`/enrollments/${enrollmentId}`);
      if (res.data.success) {
        showToast('Enrollment dropped', 'info');
        fetchEnrollments();
      }
    } catch (err) {
      showToast('Failed to drop enrollment', 'error');
    }
  };

  const columns = [
    {
      header: 'Course',
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block text-xs">{row.course?.title}</span>
          <span className="text-[11px] text-slate-400">{row.course?.code} • {row.course?.duration}</span>
        </div>
      )
    },
    ...(user?.role !== 'student'
      ? [
          {
            header: 'Student',
            render: (row) => (
              <div className="flex items-center gap-2">
                <img
                  src={row.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.student?.name || 'Student')}&background=0284c7&color=fff`}
                  alt={row.student?.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">{row.student?.name}</span>
                  <span className="text-[10px] text-slate-400">{row.student?.email}</span>
                </div>
              </div>
            )
          }
        ]
      : []),
    {
      header: 'Progress',
      render: (row) => (
        <div className="w-32">
          <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
            <span>{row.progressPercentage || 0}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{ width: `${row.progressPercentage || 0}%` }}
            />
          </div>
        </div>
      )
    },
    {
      header: 'Enrolled On',
      render: (row) => (
        <span className="text-xs text-slate-500">{formatDate(row.enrollmentDate || row.createdAt)}</span>
      )
    },
    {
      header: 'Status',
      render: (row) => {
        const badge = getStatusBadge(row.status);
        return (
          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.color}`}>
            {badge.label}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.status !== 'dropped' && (
            <button
              onClick={() => handleDrop(row._id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Drop Course"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Course Enrollments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track student registrations, active progression, and completion status
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={enrollments}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search enrollments..."
        emptyMessage="No course enrollments found."
      />

      {/* Enroll Modal */}
      <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title="Enroll Student into Course">
        <form onSubmit={handleEnrollStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Course *</label>
            <select
              required
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Choose a course...</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
            <select
              required
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Choose a student...</option>
              {students.map((s) => (
                <option key={s.user?._id || s._id} value={s.user?._id || s.user}>
                  {s.user?.name} ({s.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEnrollModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs text-white bg-blue-600 rounded-xl"
            >
              Confirm Enrollment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
