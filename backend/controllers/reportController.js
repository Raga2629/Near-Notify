import Report from '../models/Report.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

// @desc    Create a report for a post
// @route   POST /reports
// @access  Private
export const createReport = async (req, res) => {
  try {
    const { postId, reason } = req.body;

    const reportExists = await Report.findOne({ postId, reportedBy: req.user._id });
    if (reportExists) {
      return res.status(400).json({ message: 'You have already reported this post' });
    }

    const report = await Report.create({
      postId,
      reportedBy: req.user._id,
      reason
    });

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postAuthor = await User.findById(post.createdBy);
    
    // Decrease trust score: -20 for being reported
    if (postAuthor) {
      postAuthor.trustScore -= 20;
      await postAuthor.save();
    }

    // Check total reports for this post
    const reportCount = await Report.countDocuments({ postId });
    
    // Auto-hide if reports >= 3
    if (reportCount >= 3) {
      post.status = 'pending'; // Auto-hide post
      post.isSuspicious = true;
      await post.save();
      
      // Notify via socket
      if (req.io) {
          req.io.emit('post_hidden_due_to_reports', post);
      }
    }

    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
