import express from 'express';
import {
  getCourseLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  toggleLessonCompletion
} from '../controllers/lessonController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/course/:courseId', getCourseLessons);
router.get('/:id', protect, getLessonById);

router.post('/', protect, authorize('admin', 'teacher'), createLesson);
router.put('/:id', protect, authorize('admin', 'teacher'), updateLesson);
router.delete('/:id', protect, authorize('admin', 'teacher'), deleteLesson);
router.post('/:id/toggle-completion', protect, toggleLessonCompletion);

export default router;
