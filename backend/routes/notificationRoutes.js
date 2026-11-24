import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.post('/', authorize('admin', 'teacher'), createNotification);
router.delete('/:id', authorize('admin'), deleteNotification);

export default router;
