import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Lesson from '../models/Lesson.js';
import Assignment from '../models/Assignment.js';
import Quiz from '../models/Quiz.js';
import Teacher from '../models/Teacher.js';

// @desc    Get all courses with search, filters, pagination
// @route   GET /api/courses
// @access  Public / Private
export const getAllCourses = async (req, res, next) => {
  try {
    const { search, category, level, status, teacher, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }
    if (level && level !== 'all') {
      query.level = level;
    }
    if (status && status !== 'all') {
      query.status = status;
    } else if (!req.user || req.user.role === 'student') {
      // Students and public only see published courses by default
      query.status = 'published';
    }
    if (teacher) {
      query.teacher = teacher;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('teacher', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: Number(page),
      courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course with details, lessons, assignments, quizzes
// @route   GET /api/courses/:id
// @access  Public / Private
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'name email avatar bio');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const lessons = await Lesson.find({ course: course._id }).sort({ order: 1 });
    const assignments = await Assignment.find({ course: course._id }).sort({ deadline: 1 });
    const quizzes = await Quiz.find({ course: course._id, status: 'published' });

    let isEnrolled = false;
    let enrollment = null;

    if (req.user) {
      enrollment = await Enrollment.findOne({ course: course._id, student: req.user._id });
      if (enrollment) {
        isEnrolled = true;
      }
    }

    res.status(200).json({
      success: true,
      course,
      lessons,
      assignments,
      quizzes,
      isEnrolled,
      enrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Admin, Teacher)
export const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      code,
      description,
      category,
      level = 'Beginner',
      duration = '8 Weeks',
      thumbnail,
      price = 0,
      teacher,
      status = 'published'
    } = req.body;

    const assignedTeacher = req.user.role === 'teacher' ? req.user._id : (teacher || req.user._id);

    const existingCode = await Course.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }

    const course = await Course.create({
      title,
      code: code.toUpperCase(),
      description,
      category,
      level,
      duration,
      thumbnail: thumbnail || '',
      teacher: assignedTeacher,
      price,
      status
    });

    // Update teacher assignedCourses
    await Teacher.findOneAndUpdate(
      { user: assignedTeacher },
      { $addToSet: { assignedCourses: course._id } }
    );

    const populatedCourse = await Course.findById(course._id).populate('teacher', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: populatedCourse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin, Assigned Teacher)
export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Role check: Only admin or course teacher can edit
    if (req.user.role === 'teacher' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this course' });
    }

    const {
      title,
      code,
      description,
      category,
      level,
      duration,
      thumbnail,
      teacher,
      price,
      status
    } = req.body;

    if (title) course.title = title;
    if (code) course.code = code.toUpperCase();
    if (description) course.description = description;
    if (category) course.category = category;
    if (level) course.level = level;
    if (duration) course.duration = duration;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (price !== undefined) course.price = price;
    if (status) course.status = status;
    if (teacher && req.user.role === 'admin') course.teacher = teacher;

    await course.save();

    const updated = await Course.findById(course._id).populate('teacher', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin, Assigned Teacher)
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (req.user.role === 'teacher' && course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this course' });
    }

    await Lesson.deleteMany({ course: course._id });
    await Assignment.deleteMany({ course: course._id });
    await Quiz.deleteMany({ course: course._id });
    await Enrollment.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course and all related lessons, assignments, and enrollments deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get course categories
// @route   GET /api/courses/categories
// @access  Public
export const getCourseCategories = async (req, res, next) => {
  try {
    const categories = await Course.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    next(error);
  }
};
