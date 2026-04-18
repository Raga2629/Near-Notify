import express from 'express';
import { sendMessage, getMessages } from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/:postId', protect, getMessages);

export default router;
