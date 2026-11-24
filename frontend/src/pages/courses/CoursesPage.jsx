import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import {
  BookOpen,
  Plus,
  Search,
  Clock,
  Users,
  Award,
  Layers,
  ArrowRight,
  Edit2,
  Trash2,
  DollarSign,
  CheckCircle2
} from 'lucide-react';

export const CoursesPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    description: '',
    category: 'Web Development',
    level: 'Beginner',
    duration: '8 Weeks',
    price: 0,
    thumbnail: '',
    teacher: ''
  });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        category: selectedCategory,
        level: selectedLevel,
        limit: 50
      };
      const res = await api.get('/courses', { params });
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedLevel, showToast]);

  const fetchMetadata = async () => {
    try {
      const [catRes, teachRes] = await Promise.all([
        api.get('/courses/categories'),
        user?.role === 'admin' ? api.get('/teachers') : Promise.resolve({ data: { teachers: [] } })
      ]);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (teachRes.data.success) setTeachers(teachRes.data.teachers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchMetadata();
  }, [fetchCourses]);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      code: `CS-${Math.floor(100 + Math.random() * 900)}`,
      description: '',
      category: 'Web Development',
      level: 'Beginner',
      duration: '8 Weeks',
      price: 99,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
      teacher: teachers[0]?.user?._id || user?._id || ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (course) => {
    setSelectedCourse(course);
    setFormData({
      title: course.title,
      code: course.code,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price || 0,
      thumbnail: course.thumbnail || '',
      teacher: course.teacher?._id || ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (course) => {
    setSelectedCourse(course);
    setIsDeleteModalOpen(true);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/courses', formData);
      if (res.data.success) {
        showToast('Course created successfully!', 'success');
        setIsAddModalOpen(false);
        fetchCourses();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create course', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/courses/${selectedCourse._id}`, formData);
      if (res.data.success) {
        showToast('Course updated successfully!', 'success');
        setIsEditModalOpen(false);
        fetchCourses();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update course', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async () => {
    setSubmitting(true);
    try {
      const res = await api.delete(`/courses/${selectedCourse._id}`);
      if (res.data.success) {
        showToast('Course deleted successfully', 'success');
        setIsDeleteModalOpen(false);
        fetchCourses();
      }
    } catch (err) {
      showToast('Failed to delete course', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Course Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Explore academic curriculum, manage lessons, assignments, quizzes, and enrollments
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </button>
        )}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search course title, code, keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500">Level:</span>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            All Categories
          </button>
          {['Web Development', 'Data Science', 'Design', 'Cloud Computing', 'Cybersecurity'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <span className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block" />
          <p className="text-xs text-slate-400 mt-2 font-medium">Loading courses...</p>
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Course Thumbnail */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-slate-900/80 text-white backdrop-blur-md">
                      {course.code}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600/90 text-white backdrop-blur-md">
                      {course.category}
                    </span>
                  </div>

                  {(user?.role === 'admin' || (user?.role === 'teacher' && course.teacher?._id === user?._id)) && (
                    <div className="absolute top-3 right-3 flex gap-1.5 opacity-90">
                      <button
                        onClick={() => handleOpenEdit(course)}
                        className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 shadow-md transition-all"
                        title="Edit Course"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(course)}
                        className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-rose-600 shadow-md transition-all"
                        title="Delete Course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-5">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {course.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> {course.level}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {course.enrolledCount || 0} Enrolled
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Course Footer */}
              <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={course.teacher?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.teacher?.name || 'Teacher')}&background=0284c7&color=fff`}
                    alt={course.teacher?.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                    {course.teacher?.name || 'Faculty Instructor'}
                  </span>
                </div>

                <Link
                  to={`/courses/${course._id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-semibold rounded-xl transition-all"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-base font-bold text-slate-700">No courses found matching your filter</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing your search term or select another category.</p>
        </div>
      )}

      {/* Add Course Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Course" maxWidth="max-w-2xl">
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="e.g. Master React & Node.js"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase"
                placeholder="CS-101"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Description *</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="Outline what students will learn in this course..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Design">Design</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="8 Weeks"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Thumbnail Image URL</label>
              <input
                type="text"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            {user?.role === 'admin' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Teacher</label>
                <select
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Select Instructor</option>
                  {teachers.map((t) => (
                    <option key={t.user?._id} value={t.user?._id}>
                      {t.user?.name} ({t.department})
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              {submitting ? 'Creating Course...' : 'Save & Publish Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Course Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Course Details" maxWidth="max-w-2xl">
        <form onSubmit={handleUpdateCourse} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Code</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Design">Design</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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

      {/* Delete Course Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCourse}
        loading={submitting}
        title="Delete Course"
        message={`Are you sure you want to delete ${selectedCourse?.title}? All associated lessons, quizzes, assignments and student enrollments will be permanently removed.`}
      />
    </div>
  );
};
