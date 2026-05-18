import express from 'express';
import { createPost, getNearbyPosts, getPostById, getPostSummary } from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createPost)
  .get(getNearbyPosts);

router.get('/summary', getPostSummary);

router.route('/:id').get(getPostById);

export default router;
