import express from 'express';
import {
  markAttendance,
  getAttendanceByCourseAndDate,
  getCourseAttendanceReport,
  getStudentAttendanceReport
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin', 'teacher'), markAttendance);
router.get('/course/:courseId', getAttendanceByCourseAndDate);
router.get('/course/:courseId/report', authorize('admin', 'teacher'), getCourseAttendanceReport);
router.get('/student/:studentId', getStudentAttendanceReport);

export default router;
