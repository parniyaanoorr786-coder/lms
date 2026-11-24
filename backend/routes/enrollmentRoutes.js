import express from 'express';
import {
  enrollStudent,
  getAllEnrollments,
  getMyEnrollments,
  getCourseEnrollments,
  updateEnrollmentStatus,
  dropEnrollment
} from '../controllers/enrollmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', enrollStudent);
router.get('/my', getMyEnrollments);
router.get('/course/:courseId', getCourseEnrollments);
router.get('/', authorize('admin', 'teacher'), getAllEnrollments);
router.put('/:id', authorize('admin', 'teacher'), updateEnrollmentStatus);
router.delete('/:id', dropEnrollment);

export default router;
