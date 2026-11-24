import Notification from '../models/Notification.js';

// @desc    Get user notifications (broadcast + user-specific)
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipient: null }, // broadcast
        { recipient: req.user._id }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(20);

    const formatted = notifications.map((n) => {
      const obj = n.toObject();
      obj.isRead = n.readBy.some((id) => id.toString() === req.user._id.toString());
      return obj;
    });

    const unreadCount = formatted.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      notifications: formatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (!notification.readBy.includes(req.user._id)) {
      notification.readBy.push(req.user._id);
      await notification.save();
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [{ recipient: null }, { recipient: req.user._id }],
        readBy: { $ne: req.user._id }
      },
      {
        $addToSet: { readBy: req.user._id }
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new broadcast or targeted notification
// @route   POST /api/notifications
// @access  Private (Admin, Teacher)
export const createNotification = async (req, res, next) => {
  try {
    const { title, message, type = 'announcement', recipient = null, link = '' } = req.body;

    const notification = await Notification.create({
      title,
      message,
      type,
      recipient: recipient || null,
      link
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Admin)
export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
