import express from 'express';
import { getAdminStats, getAdminPosts, getReportedPosts, approvePost, rejectPost, toggleUserActive } from '../controllers/adminController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getAdminStats);
router.get('/posts', getAdminPosts);
router.put('/posts/:id/approve', approvePost);
router.put('/posts/:id/reject', rejectPost);
router.put('/users/:id/toggle-active', toggleUserActive);

export default router;
