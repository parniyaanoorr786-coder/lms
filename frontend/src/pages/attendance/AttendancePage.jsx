import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { CalendarCheck, Check, X, Clock, AlertCircle, Save } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const AttendancePage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Student view report state
  const [studentReport, setStudentReport] = useState([]);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses?limit=50');
      if (res.data.success && res.data.courses.length > 0) {
        setCourses(res.data.courses);
        setSelectedCourse(res.data.courses[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendanceSheet = useCallback(async () => {
    if (!selectedCourse) return;
    try {
      setLoading(true);

      if (user?.role === 'student') {
        const res = await api.get(`/attendance/student/${user._id}`);
        if (res.data.success) {
          setStudentReport(res.data.courses);
        }
      } else {
        // Teacher / Admin: load enrolled students and any existing attendance for this date
        const [enrRes, attRes] = await Promise.all([
          api.get(`/enrollments/course/${selectedCourse}`),
          api.get(`/attendance/course/${selectedCourse}?date=${selectedDate}`)
        ]);

        if (enrRes.data.success) {
          setEnrolledStudents(enrRes.data.enrollments);

          // Populate attendance status mapping
          const initialMap = {};
          enrRes.data.enrollments.forEach((e) => {
            initialMap[e.student._id] = { status: 'present', remarks: '' };
          });

          if (attRes.data.success && attRes.data.attendance.length > 0) {
            const existingRecords = attRes.data.attendance[0].records || [];
            existingRecords.forEach((rec) => {
              if (rec.student) {
                const sId = rec.student._id || rec.student;
                initialMap[sId] = {
                  status: rec.status || 'present',
                  remarks: rec.remarks || ''
                };
              }
            });
          }

          setAttendanceRecords(initialMap);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load attendance records', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, selectedDate, user?.role, user?._id, showToast]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchAttendanceSheet();
    }
  }, [selectedCourse, selectedDate, fetchAttendanceSheet]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleRemarkChange = (studentId, remarks) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const recordsArray = Object.keys(attendanceRecords).map((studentId) => ({
        student: studentId,
        status: attendanceRecords[studentId].status,
        remarks: attendanceRecords[studentId].remarks
      }));

      const res = await api.post('/attendance', {
        courseId: selectedCourse,
        date: selectedDate,
        records: recordsArray
      });

      if (res.data.success) {
        showToast('Attendance recorded successfully!', 'success');
      }
    } catch (err) {
      showToast('Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Student Attendance View
  if (user?.role === 'student') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Attendance History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your class attendance records and overall lecture attendance percentage
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <span className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block" />
          </div>
        ) : studentReport.length > 0 ? (
          <div className="space-y-4">
            {studentReport.map((stat) => (
              <div key={stat.course._id} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{stat.course.title}</h3>
                    <span className="text-xs text-slate-400 font-mono">{stat.course.code}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-bold ${stat.percentage >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {stat.percentage}% Attendance Rate
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {stat.present} Present • {stat.absent} Absent • {stat.late} Late
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Class Session Log</h4>
                  <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">
                    {stat.history.map((h, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <span className="text-slate-600">{formatDate(h.date)}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] uppercase ${
                              h.status === 'present'
                                ? 'bg-emerald-50 text-emerald-700'
                                : h.status === 'absent'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {h.status}
                          </span>
                          {h.remarks && <span className="text-slate-400 text-[11px]">({h.remarks})</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8">
            <p className="text-sm font-semibold text-slate-600">No attendance records found yet.</p>
          </div>
        )}
      </div>
    );
  }

  // Teacher / Admin Attendance Sheet View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance Register</h1>
          <p className="text-xs text-slate-500 mt-1">
            Mark daily course attendance, log present/absent students, and enter session remarks
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || enrolledStudents.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md disabled:opacity-50 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Sheet...' : 'Save Attendance'}</span>
        </button>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-1/2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Select Course:</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-1/2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          />
        </div>
      </div>

      {/* Attendance Sheet Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            Enrolled Students ({enrolledStudents.length})
          </span>
          <span className="text-xs text-slate-400">Date: {selectedDate}</span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <span className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block" />
          </div>
        ) : enrolledStudents.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {enrolledStudents.map((enr) => {
              const studentId = enr.student?._id;
              const currentStatus = attendanceRecords[studentId]?.status || 'present';
              const currentRemarks = attendanceRecords[studentId]?.remarks || '';

              return (
                <div
                  key={enr._id}
                  className="p-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={enr.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(enr.student?.name || 'Student')}&background=0284c7&color=fff`}
                      alt={enr.student?.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <span className="font-semibold text-slate-800 block text-xs">{enr.student?.name}</span>
                      <span className="text-[11px] text-slate-400">{enr.student?.email}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Status Toggles */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(studentId, 'present')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          currentStatus === 'present'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(studentId, 'absent')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          currentStatus === 'absent'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(studentId, 'late')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          currentStatus === 'late'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Late
                      </button>
                    </div>

                    {/* Remarks Input */}
                    <input
                      type="text"
                      placeholder="Remarks..."
                      value={currentRemarks}
                      onChange={(e) => handleRemarkChange(studentId, e.target.value)}
                      className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl w-44 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 text-xs">
            No students enrolled in this course to mark attendance.
          </div>
        )}
      </div>
    </div>
  );
};
