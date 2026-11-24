import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import {
  BookOpen,
  PlayCircle,
  FileText,
  HelpCircle,
  Users,
  CheckCircle2,
  Clock,
  Award,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  Calendar,
  CheckSquare,
  Square,
  ExternalLink,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const CourseDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lessons'); // lessons, assignments, quizzes, students

  // Enrolled students list
  const [enrolledStudents, setEnrolledStudents] = useState([]);

  // Video lecture preview modal
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  // Lesson CRUD modal
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    duration: '30 mins',
    videoUrl: '',
    isFreePreview: false
  });

  // Assignment Create Modal
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    deadline: '',
    maxScore: 100
  });

  // Assignment Submit Modal (Student)
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  // Submissions Review Modal (Teacher/Admin)
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [currentSubmissions, setCurrentSubmissions] = useState([]);
  const [gradingScore, setGradingScore] = useState({});
  const [gradingFeedback, setGradingFeedback] = useState({});

  // Quiz Take Modal (Student)
  const [takeQuizModalOpen, setTakeQuizModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // Quiz Create Modal (Teacher/Admin)
  const [createQuizModalOpen, setCreateQuizModalOpen] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    timeLimitMinutes: 15,
    passingScore: 60,
    questions: [
      {
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        points: 25
      }
    ]
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/courses/${id}`);
      if (res.data.success) {
        setCourse(res.data.course);
        setLessons(res.data.lessons);
        setAssignments(res.data.assignments);
        setQuizzes(res.data.quizzes);
        setIsEnrolled(res.data.isEnrolled);
        setEnrollment(res.data.enrollment);
      }

      // Fetch enrolled students for teachers/admin
      if (user?.role === 'admin' || user?.role === 'teacher') {
        const enrRes = await api.get(`/enrollments/course/${id}`);
        if (enrRes.data.success) {
          setEnrolledStudents(enrRes.data.enrollments);
        }
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load course details', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, user?.role, showToast]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Handle Enroll / Drop
  const handleEnrollToggle = async () => {
    setSubmitting(true);
    try {
      if (isEnrolled && enrollment) {
        await api.delete(`/enrollments/${enrollment._id}`);
        showToast('Successfully dropped course', 'info');
      } else {
        await api.post('/enrollments', { courseId: course._id });
        showToast('Enrolled in course successfully!', 'success');
      }
      fetchCourseData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Lesson Completion
  const handleToggleLesson = async (lessonId) => {
    if (!isEnrolled) {
      showToast('Please enroll in the course to track lesson completion', 'warning');
      return;
    }
    try {
      const res = await api.post(`/lessons/${lessonId}/toggle-completion`);
      if (res.data.success) {
        setEnrollment((prev) => ({
          ...prev,
          progressPercentage: res.data.progressPercentage,
          completedLessons: res.data.completedLessons
        }));
        showToast(res.data.completed ? 'Lesson completed! Great job.' : 'Lesson marked incomplete', 'info');
      }
    } catch (err) {
      showToast('Failed to update lesson status', 'error');
    }
  };

  // Create Lesson
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/lessons', { ...lessonForm, course: course._id });
      if (res.data.success) {
        showToast('Lesson added successfully!', 'success');
        setLessonModalOpen(false);
        setLessonForm({ title: '', description: '', duration: '30 mins', videoUrl: '', isFreePreview: false });
        fetchCourseData();
      }
    } catch (err) {
      showToast('Failed to create lesson', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Create Assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/assignments', { ...assignmentForm, course: course._id });
      if (res.data.success) {
        showToast('Assignment published successfully!', 'success');
        setAssignmentModalOpen(false);
        fetchCourseData();
      }
    } catch (err) {
      showToast('Failed to publish assignment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Assignment
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post(`/assignments/${selectedAssignment._id}/submit`, {
        submissionText,
        fileUrl
      });
      if (res.data.success) {
        showToast('Assignment submitted successfully!', 'success');
        setSubmitModalOpen(false);
        setSubmissionText('');
        setFileUrl('');
        fetchCourseData();
      }
    } catch (err) {
      showToast('Failed to submit assignment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // View Submissions
  const handleOpenSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    try {
      const res = await api.get(`/assignments/${assignment._id}/submissions`);
      if (res.data.success) {
        setCurrentSubmissions(res.data.submissions);
        setSubmissionsModalOpen(true);
      }
    } catch (err) {
      showToast('Failed to fetch submissions', 'error');
    }
  };

  // Grade Submission
  const handleGradeSubmission = async (submissionId) => {
    const score = gradingScore[submissionId];
    const feedback = gradingFeedback[submissionId] || '';
    if (score === undefined || score === '') {
      showToast('Please enter a grade score', 'warning');
      return;
    }
    try {
      const res = await api.put(`/assignments/submissions/${submissionId}/grade`, {
        score: Number(score),
        feedback
      });
      if (res.data.success) {
        showToast('Submission graded successfully!', 'success');
        // Update local list
        setCurrentSubmissions((prev) =>
          prev.map((s) => (s._id === submissionId ? res.data.submission : s))
        );
      }
    } catch (err) {
      showToast('Failed to save grade', 'error');
    }
  };

  // Take Quiz
  const handleStartQuiz = async (quiz) => {
    try {
      const res = await api.get(`/quizzes/${quiz._id}`);
      if (res.data.success) {
        setActiveQuiz(res.data.quiz);
        setSelectedAnswers({});
        setQuizResult(res.data.pastResult || null);
        setTakeQuizModalOpen(true);
      }
    } catch (err) {
      showToast('Failed to load quiz questions', 'error');
    }
  };

  const handleSubmitQuizAnswers = async () => {
    setSubmitting(true);
    try {
      const answersArray = activeQuiz.questions.map((_, idx) => selectedAnswers[idx] ?? null);
      const res = await api.post(`/quizzes/${activeQuiz._id}/submit`, { answers: answersArray });
      if (res.data.success) {
        setQuizResult(res.data.result);
        showToast('Quiz submitted & graded!', 'success');
        fetchCourseData();
      }
    } catch (err) {
      showToast('Failed to submit quiz', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Add Question to Quiz Form
  const handleAddQuestionToForm = () => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { questionText: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 25 }
      ]
    }));
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/quizzes', { ...quizForm, course: course._id });
      if (res.data.success) {
        showToast('Quiz created successfully!', 'success');
        setCreateQuizModalOpen(false);
        fetchCourseData();
      }
    } catch (err) {
      showToast('Failed to create quiz', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <span className="w-9 h-9 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin inline-block" />
        <p className="text-xs text-slate-400 mt-2">Loading course curriculum...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl p-8 border border-slate-100">
        <p className="text-base font-semibold text-slate-800">Course not found</p>
        <Link to="/courses" className="mt-3 inline-block text-xs text-blue-600 font-semibold hover:underline">
          Return to Courses Catalog
        </Link>
      </div>
    );
  }

  const isCompleted = (lessonId) => {
    return enrollment?.completedLessons?.includes(lessonId);
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/courses" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all courses</span>
      </Link>

      {/* Hero Header Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
        <div className="absolute inset-0 opacity-25">
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6 backdrop-blur-sm bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full font-bold bg-blue-600 text-white">{course.code}</span>
              <span className="px-3 py-1 rounded-full font-semibold bg-white/20 text-white">{course.category}</span>
              <span className="px-3 py-1 rounded-full font-semibold bg-white/10 text-slate-300">{course.level}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{course.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{course.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
              <span>Duration: <strong>{course.duration}</strong></span>
              <span>•</span>
              <span>Instructor: <strong>{course.teacher?.name}</strong></span>
              <span>•</span>
              <span>Enrolled: <strong>{course.enrolledCount} Students</strong></span>
            </div>
          </div>

          {/* Action button: Enroll / Drop or Progress */}
          <div className="flex-shrink-0 flex flex-col gap-2">
            {user?.role === 'student' && (
              <>
                <button
                  onClick={handleEnrollToggle}
                  disabled={submitting}
                  className={`px-6 py-3 rounded-2xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isEnrolled
                      ? 'bg-rose-600/90 hover:bg-rose-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  }`}
                >
                  {isEnrolled ? 'Unenroll from Course' : 'Enroll in this Course Now'}
                </button>
                {isEnrolled && (
                  <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl text-center">
                    <span className="text-[11px] text-slate-300 block mb-1">Your Progress</span>
                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${enrollment?.progressPercentage || 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white mt-1 block">
                      {enrollment?.progressPercentage || 0}% Completed
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'lessons'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>Lessons ({lessons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'assignments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Assignments ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'quizzes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Quizzes ({quizzes.length})</span>
        </button>

        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'students'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Enrolled Students ({enrolledStudents.length})</span>
          </button>
        )}
      </div>

      {/* TAB 1: LESSONS */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Curriculum Video Lectures & Notes</h2>
            {(user?.role === 'admin' || user?.role === 'teacher') && (
              <button
                onClick={() => setLessonModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-blue-700 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lesson</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {lessons && lessons.length > 0 ? (
              lessons.map((lesson, idx) => (
                <div
                  key={lesson._id}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Completion Checkbox for Student */}
                    {user?.role === 'student' && (
                      <button
                        onClick={() => handleToggleLesson(lesson._id)}
                        className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors"
                        title={isCompleted(lesson._id) ? 'Mark Incomplete' : 'Mark Completed'}
                      >
                        {isCompleted(lesson._id) ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-blue-600" />
                        )}
                      </button>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">Lesson {idx + 1}</span>
                        {lesson.isFreePreview && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            Free Preview
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{lesson.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{lesson.description}</p>

                      {/* Study materials list */}
                      {lesson.studyMaterials && lesson.studyMaterials.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {lesson.studyMaterials.map((mat, mIdx) => (
                            <a
                              key={mIdx}
                              href={mat.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-100"
                            >
                              <Download className="w-3 h-3" />
                              <span>{mat.title}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {lesson.duration}
                    </span>

                    {lesson.videoUrl && (
                      <button
                        onClick={() => {
                          setCurrentVideo(lesson);
                          setVideoModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Watch Lecture</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center bg-white rounded-2xl border border-slate-100">
                No lessons uploaded for this course yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Course Assignments & Homework</h2>
            {(user?.role === 'admin' || user?.role === 'teacher') && (
              <button
                onClick={() => setAssignmentModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-blue-700 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Assignment</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {assignments && assignments.length > 0 ? (
              assignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{assignment.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{assignment.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Due: <strong>{formatDate(assignment.deadline)}</strong>
                      </span>
                      <span>•</span>
                      <span>Max Score: <strong>{assignment.maxScore} pts</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user?.role === 'student' && (
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setSubmitModalOpen(true);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                      >
                        {assignment.submission ? 'Update Submission' : 'Submit Work'}
                      </button>
                    )}

                    {(user?.role === 'admin' || user?.role === 'teacher') && (
                      <button
                        onClick={() => handleOpenSubmissions(assignment)}
                        className="px-4 py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                      >
                        Review Submissions
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center bg-white rounded-2xl border border-slate-100">
                No assignments posted for this course.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: QUIZZES */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Course Assessment Quizzes</h2>
            {(user?.role === 'admin' || user?.role === 'teacher') && (
              <button
                onClick={() => setCreateQuizModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-blue-700 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create MCQ Quiz</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes && quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                      {quiz.questions?.length || 0} Questions
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-2">{quiz.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{quiz.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-3">
                      <span>Time: <strong>{quiz.timeLimitMinutes} mins</strong></span>
                      <span>•</span>
                      <span>Passing: <strong>{quiz.passingScore}%</strong></span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    {user?.role === 'student' && quiz.latestResult ? (
                      <span className={`text-xs font-bold ${quiz.latestResult.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                        Score: {quiz.latestResult.percentage}% ({quiz.latestResult.passed ? 'Passed' : 'Failed'})
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Not attempted</span>
                    )}

                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                    >
                      {user?.role === 'student' ? 'Take Quiz' : 'Preview Quiz'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-xs text-slate-400 py-6 text-center bg-white rounded-2xl border border-slate-100">
                No quizzes available for this course yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ENROLLED STUDENTS (Admin/Teacher) */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800">Students Enrolled in this Course</h2>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
            {enrolledStudents && enrolledStudents.length > 0 ? (
              enrolledStudents.map((enr) => (
                <div key={enr._id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={enr.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(enr.student?.name || 'Student')}&background=0284c7&color=fff`}
                      alt={enr.student?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{enr.student?.name}</p>
                      <p className="text-[11px] text-slate-400">{enr.student?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Progress</span>
                      <strong className="text-blue-600">{enr.progressPercentage || 0}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Status</span>
                      <span className="font-semibold text-emerald-700 uppercase text-[10px]">{enr.status}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No students currently enrolled.</p>
            )}
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      <Modal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} title={currentVideo?.title || 'Video Lecture'} maxWidth="max-w-3xl">
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg">
          {currentVideo?.videoUrl ? (
            <iframe
              src={currentVideo.videoUrl}
              title={currentVideo.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              No video stream link configured
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-4 leading-relaxed">{currentVideo?.description}</p>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal isOpen={lessonModalOpen} onClose={() => setLessonModalOpen(false)} title="Add Lesson Lecture">
        <form onSubmit={handleCreateLesson} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lesson Title *</label>
            <input
              type="text"
              required
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="e.g. Master React Hooks"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={lessonForm.description}
              onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={lessonForm.duration}
                onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="45 mins"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Video Stream Embed URL</label>
              <input
                type="text"
                value={lessonForm.videoUrl}
                onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setLessonModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs text-white bg-blue-600 rounded-xl"
            >
              Add Lesson
            </button>
          </div>
        </form>
      </Modal>

      {/* Assignment Submit Modal (Student) */}
      <Modal isOpen={submitModalOpen} onClose={() => setSubmitModalOpen(false)} title={`Submit: ${selectedAssignment?.title}`}>
        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Submission Notes / Summary</label>
            <textarea
              rows={3}
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="Explain how you completed this assignment..."
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Link / GitHub Repo / File URL</label>
            <input
              type="text"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              placeholder="https://github.com/my-repo"
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs text-white bg-blue-600 rounded-xl"
            >
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assignment Review Submissions Modal (Teacher) */}
      <Modal isOpen={submissionsModalOpen} onClose={() => setSubmissionsModalOpen(false)} title={`Submissions: ${selectedAssignment?.title}`} maxWidth="max-w-3xl">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {currentSubmissions && currentSubmissions.length > 0 ? (
            currentSubmissions.map((sub) => (
              <div key={sub._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-slate-800">{sub.student?.name}</strong>
                    <span className="text-[11px] text-slate-400 block">{sub.student?.email}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {sub.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{sub.submissionText || 'No text provided'}</p>

                {sub.fileUrl && (
                  <a
                    href={sub.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Submitted URL / Code</span>
                  </a>
                )}

                {/* Grade input form */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-3">
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder={`Score (/${selectedAssignment?.maxScore || 100})`}
                      value={gradingScore[sub._id] !== undefined ? gradingScore[sub._id] : (sub.score ?? '')}
                      onChange={(e) => setGradingScore({ ...gradingScore, [sub._id]: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Instructor feedback..."
                      value={gradingFeedback[sub._id] !== undefined ? gradingFeedback[sub._id] : (sub.feedback || '')}
                      onChange={(e) => setGradingFeedback({ ...gradingFeedback, [sub._id]: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <button
                    onClick={() => handleGradeSubmission(sub._id)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
                  >
                    Save Grade
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No student submissions yet.</p>
          )}
        </div>
      </Modal>

      {/* Take Quiz Modal (Student) */}
      <Modal isOpen={takeQuizModalOpen} onClose={() => setTakeQuizModalOpen(false)} title={activeQuiz?.title || 'Interactive Quiz'} maxWidth="max-w-2xl">
        {quizResult ? (
          <div className="text-center py-6 space-y-4">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${quizResult.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {quizResult.passed ? 'Quiz Passed!' : 'Need More Practice'}
              </h3>
              <p className="text-sm font-semibold text-blue-600 mt-1">
                Your Score: {quizResult.score} / {quizResult.maxScore} ({quizResult.percentage}%)
              </p>
              <p className="text-xs text-slate-400 mt-1">Passing standard: {quizResult.passingScore || activeQuiz?.passingScore}%</p>
            </div>
            <button
              onClick={() => setTakeQuizModalOpen(false)}
              className="px-5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
            >
              Close Results
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-xs text-slate-500">
              Select the best answer for each question and submit to calculate your score immediately.
            </p>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
              {activeQuiz?.questions.map((q, qIdx) => (
                <div key={q._id || qIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <p className="text-xs font-bold text-slate-800">
                    Question {qIdx + 1}: {q.questionText}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                          selectedAnswers[qIdx] === optIdx
                            ? 'bg-blue-50 border-blue-400 text-blue-900 font-medium'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${qIdx}`}
                          checked={selectedAnswers[qIdx] === optIdx}
                          onChange={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-xs">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {Object.keys(selectedAnswers).length} of {activeQuiz?.questions.length} answered
              </span>
              <button
                onClick={handleSubmitQuizAnswers}
                disabled={submitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md disabled:opacity-50"
              >
                {submitting ? 'Calculating Result...' : 'Submit Answers & Finish'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Quiz Modal */}
      <Modal isOpen={createQuizModalOpen} onClose={() => setCreateQuizModalOpen(false)} title="Create Multiple Choice Quiz" maxWidth="max-w-2xl">
        <form onSubmit={handleCreateQuiz} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quiz Title</label>
              <input
                type="text"
                required
                value={quizForm.title}
                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="e.g. Unit 1 Checkpoint"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Limit (Mins)</label>
              <input
                type="number"
                value={quizForm.timeLimitMinutes}
                onChange={(e) => setQuizForm({ ...quizForm, timeLimitMinutes: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Dynamic Questions Builder */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Questions ({quizForm.questions.length})
              </span>
              <button
                type="button"
                onClick={handleAddQuestionToForm}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                + Add Another Question
              </button>
            </div>

            {quizForm.questions.map((qn, qIdx) => (
              <div key={qIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <input
                  type="text"
                  required
                  placeholder={`Question ${qIdx + 1} Prompt...`}
                  value={qn.questionText}
                  onChange={(e) => {
                    const updated = [...quizForm.questions];
                    updated[qIdx].questionText = e.target.value;
                    setQuizForm({ ...quizForm, questions: updated });
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium"
                />

                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 block font-semibold">Options & Mark Correct:</span>
                  {qn.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={qn.correctOptionIndex === oIdx}
                        onChange={() => {
                          const updated = [...quizForm.questions];
                          updated[qIdx].correctOptionIndex = oIdx;
                          setQuizForm({ ...quizForm, questions: updated });
                        }}
                        className="text-blue-600"
                      />
                      <input
                        type="text"
                        required
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt}
                        onChange={(e) => {
                          const updated = [...quizForm.questions];
                          updated[qIdx].options[oIdx] = e.target.value;
                          setQuizForm({ ...quizForm, questions: updated });
                        }}
                        className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateQuizModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs text-white bg-blue-600 rounded-xl"
            >
              Save Quiz
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
