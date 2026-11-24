import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { HelpCircle, Clock, Award, CheckCircle2 } from 'lucide-react';

export const QuizzesPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoursesAndQuizzes = async () => {
      try {
        setLoading(true);
        const cRes = await api.get('/courses?limit=50');
        if (cRes.data.success && cRes.data.courses.length > 0) {
          setCourses(cRes.data.courses);
          const firstCourseId = cRes.data.courses[0]._id;
          setSelectedCourse(firstCourseId);

          const qRes = await api.get(`/quizzes/course/${firstCourseId}`);
          if (qRes.data.success) {
            setQuizzes(qRes.data.quizzes);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndQuizzes();
  }, []);

  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    try {
      setLoading(true);
      const qRes = await api.get(`/quizzes/course/${courseId}`);
      if (qRes.data.success) {
        setQuizzes(qRes.data.quizzes);
      }
    } catch (err) {
      showToast('Failed to load quizzes', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quiz & Test Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Test comprehension with multiple-choice quizzes and review performance scores
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
      ) : quizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                    {quiz.questions?.length || 0} Questions
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {quiz.timeLimitMinutes} Mins
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{quiz.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{quiz.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Passing: <strong>{quiz.passingScore}%</strong>
                </span>

                <Link
                  to={`/courses/${selectedCourse}`}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  {user?.role === 'student' ? 'Take Quiz →' : 'View in Course →'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-100 p-8">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No quizzes available for this course yet.</p>
        </div>
      )}
    </div>
  );
};
