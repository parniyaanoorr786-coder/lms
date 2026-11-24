import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Notification from '../models/Notification.js';

// @desc    Get assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
export const getCourseAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('createdBy', 'name')
      .sort({ deadline: 1 });

    // If student, attach their submission status
    let data = assignments;
    if (req.user && req.user.role === 'student') {
      const submissions = await Submission.find({
        course: req.params.courseId,
        student: req.user._id
      });
      const subMap = {};
      submissions.forEach((s) => {
        subMap[s.assignment.toString()] = s;
      });

      data = assignments.map((a) => {
        const obj = a.toObject();
        obj.submission = subMap[a._id.toString()] || null;
        return obj;
      });
    }

    res.status(200).json({
      success: true,
      count: data.length,
      assignments: data
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single assignment details with user submission or teacher summary
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title code')
      .populate('createdBy', 'name');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    let mySubmission = null;
    let submissionsCount = 0;

    if (req.user.role === 'student') {
      mySubmission = await Submission.findOne({
        assignment: assignment._id,
        student: req.user._id
      });
    } else {
      submissionsCount = await Submission.countDocuments({ assignment: assignment._id });
    }

    res.status(200).json({
      success: true,
      assignment,
      mySubmission,
      submissionsCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create assignment
// @route   POST /api/assignments
// @access  Private (Admin, Teacher)
export const createAssignment = async (req, res, next) => {
  try {
    const { course, title, description, deadline, maxScore = 100, attachments = [] } = req.body;

    const assignment = await Assignment.create({
      course,
      title,
      description,
      deadline,
      maxScore,
      attachments,
      createdBy: req.user._id
    });

    // Create system notification for all enrolled students
    await Notification.create({
      title: 'New Assignment Posted',
      message: `A new assignment "${title}" has been published. Due on ${new Date(deadline).toLocaleDateString()}.`,
      type: 'assignment',
      link: `/courses/${course}`
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private (Admin, Teacher)
export const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const { title, description, deadline, maxScore, attachments } = req.body;
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (deadline) assignment.deadline = deadline;
    if (maxScore !== undefined) assignment.maxScore = maxScore;
    if (attachments !== undefined) assignment.attachments = attachments;

    await assignment.save();

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Admin, Teacher)
export const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    await Submission.deleteMany({ assignment: assignment._id });
    await Assignment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit assignment (Student)
// @route   POST /api/assignments/:id/submit
// @access  Private (Student)
export const submitAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const { submissionText, fileUrl } = req.body;

    const isLate = new Date() > new Date(assignment.deadline);

    let submission = await Submission.findOne({
      assignment: assignment._id,
      student: req.user._id
    });

    if (submission) {
      submission.submissionText = submissionText || submission.submissionText;
      submission.fileUrl = fileUrl || submission.fileUrl;
      submission.submittedAt = Date.now();
      submission.status = isLate ? 'late' : 'submitted';
      await submission.save();
    } else {
      submission = await Submission.create({
        assignment: assignment._id,
        student: req.user._id,
        course: assignment.course,
        submissionText: submissionText || '',
        fileUrl: fileUrl || '',
        status: isLate ? 'late' : 'submitted'
      });
    }

    res.status(200).json({
      success: true,
      message: isLate ? 'Assignment submitted (Late)' : 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private (Admin, Teacher)
export const getAssignmentSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name email avatar')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Grade a student submission
// @route   PUT /api/assignments/submissions/:submissionId/grade
// @access  Private (Admin, Teacher)
export const gradeSubmission = async (req, res, next) => {
  try {
    const { score, feedback } = req.body;

    const submission = await Submission.findById(req.params.submissionId)
      .populate('assignment')
      .populate('student', 'name email');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    submission.score = score;
    submission.feedback = feedback || '';
    submission.status = 'graded';
    submission.gradedBy = req.user._id;
    submission.gradedAt = Date.now();

    await submission.save();

    // Create notification for student
    await Notification.create({
      title: 'Assignment Graded',
      message: `Your submission for "${submission.assignment.title}" has been graded: ${score}/${submission.assignment.maxScore}.`,
      type: 'assignment',
      recipient: submission.student._id
    });

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    next(error);
  }
};
