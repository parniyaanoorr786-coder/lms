import Quiz from '../models/Quiz.js';
import Result from '../models/Result.js';
import Notification from '../models/Notification.js';

// @desc    Get all quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Private
export const getCourseQuizzes = async (req, res, next) => {
  try {
    const query = { course: req.params.courseId };
    if (req.user.role === 'student') {
      query.status = 'published';
    }

    const quizzes = await Quiz.find(query).sort({ createdAt: -1 });

    // If student, attach their latest result
    let data = quizzes;
    if (req.user.role === 'student') {
      const results = await Result.find({
        course: req.params.courseId,
        student: req.user._id
      });
      const resultMap = {};
      results.forEach((r) => {
        resultMap[r.quiz.toString()] = r;
      });

      data = quizzes.map((q) => {
        const obj = q.toObject();
        obj.latestResult = resultMap[q._id.toString()] || null;
        // Hide correctOptionIndex from student in the list
        obj.questions = obj.questions.map((qn) => ({
          questionText: qn.questionText,
          options: qn.options,
          points: qn.points,
          _id: qn._id
        }));
        return obj;
      });
    }

    res.status(200).json({
      success: true,
      count: data.length,
      quizzes: data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz (with questions for student/teacher)
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title code');
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const obj = quiz.toObject();

    // If student, hide correct answers unless already taken
    if (req.user.role === 'student') {
      const pastResult = await Result.findOne({ quiz: quiz._id, student: req.user._id }).sort({ completedAt: -1 });
      if (!pastResult) {
        obj.questions = obj.questions.map((q) => ({
          _id: q._id,
          questionText: q.questionText,
          options: q.options,
          points: q.points
        }));
      }
      return res.status(200).json({
        success: true,
        quiz: obj,
        pastResult
      });
    }

    res.status(200).json({
      success: true,
      quiz: obj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create quiz
// @route   POST /api/quizzes
// @access  Private (Admin, Teacher)
export const createQuiz = async (req, res, next) => {
  try {
    const { course, title, description, timeLimitMinutes = 20, passingScore = 60, questions, status = 'published' } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Please add at least one question to the quiz' });
    }

    const quiz = await Quiz.create({
      course,
      title,
      description: description || '',
      timeLimitMinutes,
      passingScore,
      questions,
      createdBy: req.user._id,
      status
    });

    // Notify students
    await Notification.create({
      title: 'New Quiz Available',
      message: `A new quiz "${title}" has been published in your course.`,
      type: 'quiz',
      link: `/courses/${course}`
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quiz
// @route   PUT /api/quizzes/:id
// @access  Private (Admin, Teacher)
export const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const { title, description, timeLimitMinutes, passingScore, questions, status } = req.body;
    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (timeLimitMinutes !== undefined) quiz.timeLimitMinutes = timeLimitMinutes;
    if (passingScore !== undefined) quiz.passingScore = passingScore;
    if (questions) quiz.questions = questions;
    if (status) quiz.status = status;

    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Admin, Teacher)
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    await Result.deleteMany({ quiz: quiz._id });
    await Quiz.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Quiz and student results deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz answers and calculate results
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
export const submitQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const { answers } = req.body; // Array of selectedOptionIndex: [0, 2, 1, ...]

    let score = 0;
    let maxScore = 0;
    let correctAnswersCount = 0;

    const detailedAnswers = quiz.questions.map((question, index) => {
      const selectedIndex = answers && answers[index] !== undefined ? answers[index] : null;
      const isCorrect = selectedIndex !== null && selectedIndex === question.correctOptionIndex;
      const points = question.points || 1;
      maxScore += points;

      if (isCorrect) {
        score += points;
        correctAnswersCount += 1;
      }

      return {
        questionIndex: index,
        selectedOptionIndex: selectedIndex,
        isCorrect
      };
    });

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    const result = await Result.create({
      quiz: quiz._id,
      student: req.user._id,
      course: quiz.course,
      answers: detailedAnswers,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctAnswersCount,
      score,
      maxScore,
      percentage,
      passed
    });

    res.status(200).json({
      success: true,
      message: passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Keep studying to improve!',
      result: {
        _id: result._id,
        score,
        maxScore,
        percentage,
        passed,
        totalQuestions: quiz.questions.length,
        correctAnswers: correctAnswersCount,
        passingScore: quiz.passingScore,
        answers: detailedAnswers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get results for a quiz (Teacher, Admin)
// @route   GET /api/quizzes/:id/results
// @access  Private (Admin, Teacher)
export const getQuizResults = async (req, res, next) => {
  try {
    const results = await Result.find({ quiz: req.params.id })
      .populate('student', 'name email avatar')
      .sort({ score: -1, completedAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    next(error);
  }
};
