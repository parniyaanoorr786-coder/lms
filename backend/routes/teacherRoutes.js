import express from 'express';
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  assignCourses
} from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);
router.post('/', authorize('admin'), createTeacher);
router.put('/:id', authorize('admin'), updateTeacher);
router.put('/:id/courses', authorize('admin'), assignCourses);
router.delete('/:id', authorize('admin'), deleteTeacher);

export default router;
