import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Get all lessons for a course
// @route   GET /api/lessons/course/:courseId
// @access  Private / Public
export const getCourseLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId }).sort({ order: 1 });
    res.status(200).json({
      success: true,
      count: lessons.length,
      lessons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Private
export const getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.status(200).json({
      success: true,
      lesson
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create lesson
// @route   POST /api/lessons
// @access  Private (Admin, Teacher)
export const createLesson = async (req, res, next) => {
  try {
    const { course, title, description, order, duration, videoUrl, isFreePreview, studyMaterials } = req.body;

    const count = await Lesson.countDocuments({ course });
    const lesson = await Lesson.create({
      course,
      title,
      description: description || '',
      order: order !== undefined ? order : count + 1,
      duration: duration || '20 mins',
      videoUrl: videoUrl || '',
      isFreePreview: !!isFreePreview,
      studyMaterials: studyMaterials || []
    });

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      lesson
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private (Admin, Teacher)
export const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const { title, description, order, duration, videoUrl, isFreePreview, studyMaterials } = req.body;

    if (title) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (order !== undefined) lesson.order = order;
    if (duration !== undefined) lesson.duration = duration;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (isFreePreview !== undefined) lesson.isFreePreview = isFreePreview;
    if (studyMaterials !== undefined) lesson.studyMaterials = studyMaterials;

    await lesson.save();

    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      lesson
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Admin, Teacher)
export const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    await Lesson.findByIdAndDelete(req.params.id);

    // Remove from completedLessons across enrollments
    await Enrollment.updateMany(
      { completedLessons: req.params.id },
      { $pull: { completedLessons: req.params.id } }
    );

    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle lesson completion for student
// @route   POST /api/lessons/:id/toggle-completion
// @access  Private (Student)
export const toggleLessonCompletion = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course
    });

    if (!enrollment) {
      return res.status(400).json({ success: false, message: 'You are not enrolled in this course' });
    }

    const isCompleted = enrollment.completedLessons.includes(lesson._id);
    if (isCompleted) {
      enrollment.completedLessons = enrollment.completedLessons.filter(
        (id) => id.toString() !== lesson._id.toString()
      );
    } else {
      enrollment.completedLessons.push(lesson._id);
    }

    // Calculate progress percentage
    const totalLessons = await Lesson.countDocuments({ course: lesson.course });
    enrollment.progressPercentage = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

    if (enrollment.progressPercentage === 100) {
      enrollment.status = 'completed';
    } else if (enrollment.status === 'completed') {
      enrollment.status = 'active';
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      completed: !isCompleted,
      progressPercentage: enrollment.progressPercentage,
      completedLessons: enrollment.completedLessons
    });
  } catch (error) {
    next(error);
  }
};
