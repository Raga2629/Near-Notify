import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /notifications — fetch for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifs);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.updateOne({ _id: req.params.id, userId: req.user._id }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PUT /notifications/read-all
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
