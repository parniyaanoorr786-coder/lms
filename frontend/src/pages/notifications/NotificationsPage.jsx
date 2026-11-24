import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Modal } from '../../components/Modal';
import {
  Bell,
  CheckCircle2,
  Plus,
  Trash2,
  Radio,
  BookOpen,
  FileText,
  HelpCircle,
  Megaphone
} from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

export const NotificationsPage = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications, showToast } = useNotifications();

  const [filterType, setFilterType] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    link: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/notifications', formData);
      if (res.data.success) {
        showToast('Announcement broadcasted to all users!', 'success');
        setIsCreateModalOpen(false);
        setFormData({ title: '', message: '', type: 'announcement', link: '' });
        fetchNotifications();
      }
    } catch (err) {
      showToast('Failed to post announcement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      showToast('Notification deleted', 'info');
      fetchNotifications();
    } catch (err) {
      showToast('Failed to delete notification', 'error');
    }
  };

  const filtered = notifications.filter(
    (n) => filterType === 'all' || n.type === filterType
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'assignment':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <Megaphone className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications & Announcements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay updated with course additions, upcoming assignment deadlines, and institutional news
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
            >
              Mark all as read
            </button>
          )}

          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast Announcement</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'announcement', 'assignment', 'quiz', 'course'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              filterType === type
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {type === 'all' ? 'All Alerts' : type}
          </button>
        ))}
      </div>

      {/* Notification Cards */}
      <div className="space-y-3">
        {filtered && filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item._id}
              onClick={() => !item.isRead && markAsRead(item._id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !item.isRead
                  ? 'bg-blue-50/50 border-blue-200 shadow-sm'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getTypeIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                  <span className="text-[11px] text-slate-400 mt-2 block font-medium">
                    {formatDateTime(item.createdAt)}
                  </span>
                </div>
              </div>

              {user?.role === 'admin' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No notifications in this category</p>
          </div>
        )}
      </div>

      {/* Broadcast Announcement Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Broadcast General Announcement">
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="e.g. Midterm Examination Schedule Announcement"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message Content *</label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="Provide complete announcement details..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="announcement">General Announcement</option>
              <option value="course">Course Notification</option>
              <option value="assignment">Assignment Alert</option>
              <option value="quiz">Quiz Alert</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs text-white bg-blue-600 rounded-xl"
            >
              {submitting ? 'Publishing...' : 'Broadcast to All'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
