import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import {
  GraduationCap,
  UserPlus,
  Edit2,
  Trash2,
  BookOpen,
  Mail,
  Award,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { getStatusBadge } from '../../utils/helpers';

export const TeachersPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Computer Science',
    qualification: "Ph.D. in Computer Science",
    specialization: 'Full Stack & Software Architecture',
    bio: ''
  });

  const [selectedCourseIds, setSelectedCourseIds] = useState([]);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/teachers', {
        params: { search: searchTerm, department: departmentFilter }
      });
      if (res.data.success) {
        setTeachers(res.data.teachers);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
      showToast('Failed to load teachers data', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, departmentFilter, showToast]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses?limit=100');
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchCourses();
  }, [fetchTeachers]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      password: 'password123',
      phone: '',
      department: 'Computer Science',
      qualification: "Ph.D. in Computer Science",
      specialization: 'Full Stack Web Development',
      bio: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.user?.name || '',
      email: teacher.user?.email || '',
      phone: teacher.user?.phone || '',
      department: teacher.department || 'Computer Science',
      qualification: teacher.qualification || '',
      specialization: teacher.specialization || '',
      bio: teacher.user?.bio || ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenAssign = (teacher) => {
    setSelectedTeacher(teacher);
    const assignedIds = (teacher.assignedCourses || []).map((c) => c._id || c);
    setSelectedCourseIds(assignedIds);
    setIsAssignModalOpen(true);
  };

  const handleOpenDelete = (teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteModalOpen(true);
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/teachers', formData);
      if (res.data.success) {
        showToast('Teacher added successfully!', 'success');
        setIsAddModalOpen(false);
        fetchTeachers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add teacher', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/teachers/${selectedTeacher._id}`, formData);
      if (res.data.success) {
        showToast('Teacher profile updated!', 'success');
        setIsEditModalOpen(false);
        fetchTeachers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update teacher', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignCourses = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/teachers/${selectedTeacher._id}/courses`, {
        courseIds: selectedCourseIds
      });
      if (res.data.success) {
        showToast('Courses assigned successfully!', 'success');
        setIsAssignModalOpen(false);
        fetchTeachers();
      }
    } catch (err) {
      showToast('Failed to assign courses', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async () => {
    setSubmitting(true);
    try {
      const res = await api.delete(`/teachers/${selectedTeacher._id}`);
      if (res.data.success) {
        showToast('Teacher deleted successfully', 'success');
        setIsDeleteModalOpen(false);
        fetchTeachers();
      }
    } catch (err) {
      showToast('Failed to delete teacher', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Instructor',
      render: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.user?.name || 'Teacher')}&background=2563eb&color=fff`}
            alt={row.user?.name}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
          />
          <div>
            <span className="font-semibold text-slate-800 block text-xs">{row.user?.name}</span>
            <span className="text-[11px] text-slate-400 block">{row.user?.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Teacher ID',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
          {row.teacherId}
        </span>
      )
    },
    {
      header: 'Department & Qualification',
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 block">{row.department}</span>
          <span className="text-[11px] text-slate-500">{row.qualification}</span>
        </div>
      )
    },
    {
      header: 'Assigned Courses',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.assignedCourses && row.assignedCourses.length > 0 ? (
            row.assignedCourses.map((c) => (
              <span
                key={c._id || c}
                className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full"
              >
                {c.code || 'Course'}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">None assigned</span>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => handleOpenAssign(row)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Assign Courses"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOpenEdit(row)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                title="Edit Teacher"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOpenDelete(row)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete Teacher"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Faculty & Teachers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic instructors, view qualifications, and assign course teaching duties
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Teacher</span>
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <span className="text-xs font-semibold text-slate-600">Department:</span>
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Departments</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Digital Design">Digital Design</option>
          <option value="Computer Science">Computer Science</option>
        </select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={teachers}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by name, ID, qualification..."
        emptyMessage="No faculty records found."
      />

      {/* Add Teacher Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Faculty Teacher">
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
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
              {submitting ? 'Creating...' : 'Save Teacher'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Courses Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Courses to Teacher">
        <form onSubmit={handleAssignCourses} className="space-y-4">
          <p className="text-xs text-slate-500">
            Select the courses that <strong>{selectedTeacher?.user?.name}</strong> will instruct and manage:
          </p>

          <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 p-3 rounded-2xl bg-slate-50">
            {courses.map((course) => {
              const isChecked = selectedCourseIds.includes(course._id);
              return (
                <label
                  key={course._id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                      : 'bg-white border-slate-200 hover:bg-slate-100/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedCourseIds(selectedCourseIds.filter((id) => id !== course._id));
                        } else {
                          setSelectedCourseIds([...selectedCourseIds, course._id]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div>
                      <span className="text-xs font-semibold block">{course.title}</span>
                      <span className="text-[10px] text-slate-400">{course.code} • {course.category}</span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Update Assigned Courses'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Teacher Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTeacher}
        loading={submitting}
        title="Remove Faculty Teacher"
        message={`Are you sure you want to remove ${selectedTeacher?.user?.name}? Their user account and assigned records will be removed.`}
      />
    </div>
  );
};
