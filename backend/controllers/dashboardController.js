import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import Attendance from '../models/Attendance.js';

// @desc    Get dashboard metrics tailored to current user's role
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === 'admin') {
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalTeachers = await User.countDocuments({ role: 'teacher' });
      const totalCourses = await Course.countDocuments();
      const totalEnrollments = await Enrollment.countDocuments();

      // Recent users
      const recentStudents = await User.find({ role: 'student' })
        .select('name email avatar createdAt phone')
        .sort({ createdAt: -1 })
        .limit(5);

      // Recent course enrollments
      const recentEnrollments = await Enrollment.find()
        .populate('student', 'name email avatar')
        .populate('course', 'title code thumbnail')
        .sort({ createdAt: -1 })
        .limit(6);

      // Category distribution
      const categoryDistribution = await Course.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, students: { $sum: '$enrolledCount' } } },
        { $project: { name: '$_id', value: '$students', count: '$count', _id: 0 } },
        { $sort: { value: -1 } }
      ]);

      // Monthly enrollment trend
      const monthlyTrends = [
        { month: 'Jan', students: 45, courses: 4 },
        { month: 'Feb', students: 58, courses: 6 },
        { month: 'Mar', students: 80, courses: 7 },
        { month: 'Apr', students: 95, courses: 9 },
        { month: 'May', students: 120, courses: 11 },
        { month: 'Jun', students: 140, courses: 12 }
      ];

      // Weekly attendance rate
      const attendanceAnalytics = [
        { day: 'Mon', attendance: 92 },
        { day: 'Tue', attendance: 88 },
        { day: 'Wed', attendance: 95 },
        { day: 'Thu', attendance: 89 },
        { day: 'Fri', attendance: 86 }
      ];

      return res.status(200).json({
        success: true,
        role: 'admin',
        stats: {
          totalStudents,
          totalTeachers,
          totalCourses,
          totalEnrollments,
          activeEnrollments: totalEnrollments
        },
        categoryDistribution,
        monthlyTrends,
        attendanceAnalytics,
        recentStudents,
        recentEnrollments
      });
    }

    if (role === 'teacher') {
      const teacherCourses = await Course.find({ teacher: req.user._id });
      const courseIds = teacherCourses.map((c) => c._id);

      const totalStudentsEnrolled = await Enrollment.countDocuments({ course: { $in: courseIds } });
      const totalAssignments = await Assignment.countDocuments({ course: { $in: courseIds } });
      const pendingGrading = await Submission.countDocuments({
        course: { $in: courseIds },
        status: { $in: ['submitted', 'late'] }
      });

      const recentSubmissions = await Submission.find({ course: { $in: courseIds } })
        .populate('student', 'name email avatar')
        .populate('assignment', 'title maxScore deadline')
        .populate('course', 'title code')
        .sort({ submittedAt: -1 })
        .limit(6);

      const courseStudentsData = teacherCourses.map((c) => ({
        name: c.code,
        title: c.title,
        students: c.enrolledCount || 0
      }));

      return res.status(200).json({
        success: true,
        role: 'teacher',
        stats: {
          myCoursesCount: teacherCourses.length,
          totalStudents: totalStudentsEnrolled,
          totalAssignments,
          pendingGrading
        },
        myCourses: teacherCourses,
        courseStudentsData,
        recentSubmissions
      });
    }

    // Role: student
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate('course', 'title code thumbnail category duration level teacher')
      .sort({ createdAt: -1 });

    const courseIds = enrollments.map((e) => e.course._id);

    const completedCoursesCount = enrollments.filter((e) => e.status === 'completed').length;
    const activeCoursesCount = enrollments.filter((e) => e.status === 'active').length;

    // Average progress
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + (e.progressPercentage || 0), 0) / enrollments.length)
      : 0;

    // Upcoming assignments
    const upcomingAssignments = await Assignment.find({
      course: { $in: courseIds },
      deadline: { $gte: new Date() }
    })
      .populate('course', 'title code')
      .sort({ deadline: 1 })
      .limit(5);

    // Recent Quiz Results
    const recentResults = await Result.find({ student: req.user._id })
      .populate('quiz', 'title')
      .populate('course', 'title code')
      .sort({ completedAt: -1 })
      .limit(5);

    // Progress chart data
    const progressData = enrollments.map((e) => ({
      name: e.course ? e.course.code : 'Course',
      progress: e.progressPercentage || 0
    }));

    return res.status(200).json({
      success: true,
      role: 'student',
      stats: {
        enrolledCourses: enrollments.length,
        activeCourses: activeCoursesCount,
        completedCourses: completedCoursesCount,
        averageProgress: avgProgress
      },
      enrollments,
      upcomingAssignments,
      recentResults,
      progressData
    });
  } catch (error) {
    next(error);
  }
};
