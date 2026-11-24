import express from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats', authorize('admin', 'teacher'), getStudentStats);
router.get('/', authorize('admin', 'teacher'), getAllStudents);
router.get('/:id', getStudentById);
router.post('/', authorize('admin'), createStudent);
router.put('/:id', authorize('admin'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);

export default router;
