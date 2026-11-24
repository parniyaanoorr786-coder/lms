import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Enroll in a course (or enroll a student)
// @route   POST /api/enrollments
// @access  Private
export const enrollStudent = async (req, res, next) => {
  try {
    const { courseId, studentId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Determine target student: if admin/teacher passes studentId, use it; else current user
    const targetStudentId = (req.user.role === 'admin' || req.user.role === 'teacher') && studentId
      ? studentId
      : req.user._id;

    const existingEnrollment = await Enrollment.findOne({
      student: targetStudentId,
      course: courseId
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === 'dropped') {
        existingEnrollment.status = 'active';
        await existingEnrollment.save();
        return res.status(200).json({
          success: true,
          message: 'Enrollment reactivated successfully',
          enrollment: existingEnrollment
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Student is already enrolled in this course'
      });
    }

    const enrollment = await Enrollment.create({
      student: targetStudentId,
      course: courseId,
      status: 'active'
    });

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });

    const populated = await Enrollment.findById(enrollment._id)
      .populate('student', 'name email avatar')
      .populate('course', 'title code thumbnail duration');

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollment: populated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enrollments (Admin, Teacher)
// @route   GET /api/enrollments
// @access  Private (Admin, Teacher)
export const getAllEnrollments = async (req, res, next) => {
  try {
    const { status, courseId, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (courseId) {
      query.course = courseId;
    }

    let enrollments = await Enrollment.find(query)
      .populate('student', 'name email avatar phone')
      .populate('course', 'title code thumbnail category duration teacher')
      .sort({ createdAt: -1 });

    if (search) {
      const term = search.toLowerCase();
      enrollments = enrollments.filter(
        (e) =>
          (e.student && e.student.name && e.student.name.toLowerCase().includes(term)) ||
          (e.student && e.student.email && e.student.email.toLowerCase().includes(term)) ||
          (e.course && e.course.title && e.course.title.toLowerCase().includes(term)) ||
          (e.course && e.course.code && e.course.code.toLowerCase().includes(term))
      );
    }

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's enrollments
// @route   GET /api/enrollments/my
// @access  Private (Student)
export const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        populate: { path: 'teacher', select: 'name email avatar' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get students enrolled in a specific course
// @route   GET /api/enrollments/course/:courseId
// @access  Private
export const getCourseEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ course: req.params.courseId, status: { $ne: 'dropped' } })
      .populate('student', 'name email avatar phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update enrollment status / grade
// @route   PUT /api/enrollments/:id
// @access  Private (Admin, Teacher)
export const updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { status, finalGrade, progressPercentage } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (status) enrollment.status = status;
    if (finalGrade !== undefined) enrollment.finalGrade = finalGrade;
    if (progressPercentage !== undefined) enrollment.progressPercentage = progressPercentage;

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Enrollment updated successfully',
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Drop / cancel enrollment
// @route   DELETE /api/enrollments/:id
// @access  Private
export const dropEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    // Role check: Only the student themselves or an admin can drop
    if (req.user.role === 'student' && enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    enrollment.status = 'dropped';
    await enrollment.save();

    await Course.findByIdAndUpdate(enrollment.course, { $inc: { enrolledCount: -1 } });

    res.status(200).json({
      success: true,
      message: 'Successfully unenrolled from course'
    });
  } catch (error) {
    next(error);
  }
};
