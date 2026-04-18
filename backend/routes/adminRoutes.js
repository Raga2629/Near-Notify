import express from 'express';
import { getPostsByStatus, approvePost, rejectPost, getReportedPosts, blockUser } from '../controllers/adminController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.get('/posts/reported', getReportedPosts);
router.get('/posts/status/:status', getPostsByStatus);
router.get('/posts/pending', (req, res, next) => {
  req.params.status = 'pending';
  getPostsByStatus(req, res, next);
});
router.put('/posts/:id/approve', approvePost);
router.put('/posts/:id/reject', rejectPost);
router.put('/users/:id/block', blockUser);

export default router;
