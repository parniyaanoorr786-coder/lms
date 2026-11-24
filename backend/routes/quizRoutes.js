import express from 'express';
import {
  getCourseQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizResults
} from '../controllers/quizController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/course/:courseId', getCourseQuizzes);
router.get('/:id', getQuizById);
router.post('/', authorize('admin', 'teacher'), createQuiz);
router.put('/:id', authorize('admin', 'teacher'), updateQuiz);
router.delete('/:id', authorize('admin', 'teacher'), deleteQuiz);

router.post('/:id/submit', authorize('student'), submitQuiz);
router.get('/:id/results', authorize('admin', 'teacher'), getQuizResults);

export default router;
