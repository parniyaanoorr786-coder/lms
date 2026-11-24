import express from 'express';
import {
  getCourseAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission
} from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/course/:courseId', getCourseAssignments);
router.get('/:id', getAssignmentById);
router.post('/', authorize('admin', 'teacher'), createAssignment);
router.put('/:id', authorize('admin', 'teacher'), updateAssignment);
router.delete('/:id', authorize('admin', 'teacher'), deleteAssignment);

router.post('/:id/submit', authorize('student'), submitAssignment);
router.get('/:id/submissions', authorize('admin', 'teacher'), getAssignmentSubmissions);
router.put('/submissions/:submissionId/grade', authorize('admin', 'teacher'), gradeSubmission);

export default router;
