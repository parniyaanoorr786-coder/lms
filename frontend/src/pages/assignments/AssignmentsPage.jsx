import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { FileText, Calendar, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const AssignmentsPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoursesAndAssignments = async () => {
      try {
        setLoading(true);
        const cRes = await api.get('/courses?limit=50');
        if (cRes.data.success && cRes.data.courses.length > 0) {
          setCourses(cRes.data.courses);
          const firstCourseId = cRes.data.courses[0]._id;
          setSelectedCourse(firstCourseId);

          const aRes = await api.get(`/assignments/course/${firstCourseId}`);
          if (aRes.data.success) {
            setAssignments(aRes.data.assignments);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndAssignments();
  }, []);

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    try {
      setLoading(true);
      const aRes = await api.get(`/assignments/course/${courseId}`);
      if (aRes.data.success) {
        setAssignments(aRes.data.assignments);
      }
    } catch (err) {
      showToast('Failed to load assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Assignments & Homework</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review assignment instructions, check deadlines, and inspect graded submissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Select Course:</span>
          <select
            value={selectedCourse}
            onChange={(e) => handleCourseChange(e.target.value)}
            className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <span className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block" />
        </div>
      ) : assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    Max Score: {assignment.maxScore} pts
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> Due {formatDate(assignment.deadline)}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{assignment.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{assignment.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {user?.role === 'student' && assignment.submission ? (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Submitted
                    {assignment.submission.score !== null && ` • Score: ${assignment.submission.score}/${assignment.maxScore}`}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Open for submissions</span>
                )}

                <Link
                  to={`/courses/${selectedCourse}`}
                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-semibold rounded-xl transition-all"
                >
                  Go to Course Page →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No assignments posted for this course yet.</p>
        </div>
      )}
    </div>
  );
};
