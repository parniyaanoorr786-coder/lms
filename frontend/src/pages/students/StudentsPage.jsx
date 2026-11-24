import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import {
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Calendar,
  Building,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { formatDate, getStatusBadge } from '../../utils/helpers';

export const StudentsPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    department: 'Computer Science',
    gradeLevel: 'Junior (Year 3)',
    guardianName: '',
    guardianPhone: '',
    status: 'active'
  });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        department: departmentFilter,
        status: statusFilter
      };
      const res = await api.get('/students', { params });
      if (res.data.success) {
        setStudents(res.data.students);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      showToast('Failed to load students data', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, departmentFilter, statusFilter, showToast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: 'password123',
      phone: '',
      address: '',
      department: 'Computer Science',
      gradeLevel: 'Junior (Year 3)',
      guardianName: '',
      guardianPhone: '',
      status: 'active'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.user?.name || '',
      email: student.user?.email || '',
      phone: student.user?.phone || '',
      address: student.user?.address || '',
      department: student.department || 'Computer Science',
      gradeLevel: student.gradeLevel || 'Junior (Year 3)',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      status: student.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleOpenView = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await api.get(`/students/${student._id}`);
      if (res.data.success) {
        setStudentDetails(res.data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      showToast('Failed to fetch detailed profile', 'error');
    }
  };

  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/students', formData);
      if (res.data.success) {
        showToast('Student added successfully!', 'success');
        setIsAddModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/students/${selectedStudent._id}`, formData);
      if (res.data.success) {
        showToast('Student profile updated!', 'success');
        setIsEditModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    setSubmitting(true);
    try {
      const res = await api.delete(`/students/${selectedStudent._id}`);
      if (res.data.success) {
        showToast('Student deleted successfully', 'success');
        setIsDeleteModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      showToast('Failed to delete student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.user?.name || 'Student')}&background=0284c7&color=fff`}
            alt={row.user?.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
          />
          <div>
            <span className="font-semibold text-slate-800 block text-xs">{row.user?.name}</span>
            <span className="text-[11px] text-slate-400 block">{row.user?.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Student ID',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
          {row.studentId}
        </span>
      )
    },
    {
      header: 'Department & Year',
      render: (row) => (
        <div>
          <span className="text-xs font-medium text-slate-700 block">{row.department}</span>
          <span className="text-[11px] text-slate-400">{row.gradeLevel}</span>
        </div>
      )
    },
    {
      header: 'Contact',
      render: (row) => (
        <span className="text-xs text-slate-500">{row.user?.phone || 'No phone'}</span>
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
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenView(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => handleOpenEdit(row)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                title="Edit Student"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOpenDelete(row)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete Student"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, search, enroll, and manage enrolled academic students
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Student</span>
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Digital Design">Digital Design</option>
            <option value="Information Technology">Information Technology</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={students}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by student name, ID, email..."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        emptyMessage="No students match your query."
      />

      {/* Add Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Student">
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Student Name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="student@school.edu"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                placeholder="+1 555-0192"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Digital Design">Digital Design</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Grade Level / Year</label>
              <select
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Freshman (Year 1)">Freshman (Year 1)</option>
                <option value="Sophomore (Year 2)">Sophomore (Year 2)</option>
                <option value="Junior (Year 3)">Junior (Year 3)</option>
                <option value="Senior (Year 4)">Senior (Year 4)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Name</label>
              <input
                type="text"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Phone</label>
              <input
                type="text"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Save Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Student Profile">
        <form onSubmit={handleUpdateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Grade Level</label>
              <input
                type="text"
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Student Details Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Student Academic Profile">
        {studentDetails && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
              <img
                src={studentDetails.student.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(studentDetails.student.user?.name || 'Student')}&background=0284c7&color=fff`}
                alt={studentDetails.student.user?.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-md"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900">{studentDetails.student.user?.name}</h3>
                <p className="text-xs text-slate-500">{studentDetails.student.user?.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                    {studentDetails.student.studentId}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                    {studentDetails.student.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Department</span>
                <span className="font-semibold text-slate-800">{studentDetails.student.department}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Academic Standing</span>
                <span className="font-semibold text-slate-800">{studentDetails.student.gradeLevel}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Guardian Contact</span>
                <span className="font-semibold text-slate-800">
                  {studentDetails.student.guardianName || 'N/A'} ({studentDetails.student.guardianPhone || 'N/A'})
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-0.5">Enrollment Date</span>
                <span className="font-semibold text-slate-800">{formatDate(studentDetails.student.enrollmentDate)}</span>
              </div>
            </div>

            {/* Enrolled Courses */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Enrolled Courses</h4>
              <div className="space-y-2">
                {studentDetails.enrollments && studentDetails.enrollments.length > 0 ? (
                  studentDetails.enrollments.map((enr) => (
                    <div key={enr._id} className="p-3 rounded-xl bg-white border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{enr.course?.title}</p>
                        <p className="text-[11px] text-slate-400">{enr.course?.code} • {enr.course?.duration}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-blue-600">{enr.progressPercentage || 0}%</span>
                        <span className="block text-[10px] text-slate-400">{enr.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Not enrolled in any courses yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteStudent}
        loading={submitting}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${selectedStudent?.user?.name}? All course enrollments, submissions and grades will be permanently deleted.`}
      />
    </div>
  );
};
