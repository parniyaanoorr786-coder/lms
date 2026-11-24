import express from 'express';
import {
  getSystemAnalytics,
  getCoursePerformance
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/analytics', authorize('admin'), getSystemAnalytics);
router.get('/course/:courseId', authorize('admin', 'teacher'), getCoursePerformance);

export default router;
