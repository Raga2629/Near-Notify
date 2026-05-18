import Chat from '../models/Chat.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

// @desc    Send a message
// @route   POST /chat/send
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { postId, message } = req.body;

    const post = await Post.findById(postId).populate('createdBy', 'name');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (!post.createdBy) return res.status(400).json({ message: 'Post author not found' });

    if (post.createdBy._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot message your own post' });
    }

    const chat = await Chat.create({
      postId,
      sender: req.user._id,
      receiver: post.createdBy,
      message
    });

    const populated = await chat.populate([
      { path: 'sender', select: 'name' },
      { path: 'receiver', select: 'name' }
    ]);

    // Create notification for receiver
    const notif = await Notification.create({
      userId: post.createdBy._id,
      title: `New message from ${req.user.name}`,
      message: `"${message.substring(0, 60)}${message.length > 60 ? '...' : ''}"`,
      type: 'chat',
    });

    // Push via socket if receiver is connected
    if (req.io) {
      req.io.to(`user_${post.createdBy._id}`).emit('new_notification', notif);
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get messages for a post (between current user and post owner)
// @route   GET /chat/:postId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const messages = await Chat.find({
      postId,
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
