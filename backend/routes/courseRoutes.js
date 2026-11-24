import express from 'express';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseCategories
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/categories', getCourseCategories);
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

router.post('/', protect, authorize('admin', 'teacher'), createCourse);
router.put('/:id', protect, authorize('admin', 'teacher'), updateCourse);
router.delete('/:id', protect, authorize('admin', 'teacher'), deleteCourse);

export default router;
