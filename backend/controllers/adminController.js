import Post from '../models/Post.js';
import User from '../models/User.js';
import Report from '../models/Report.js';

// @desc    Get posts by status
// @route   GET /admin/posts/status/:status
// @access  Private/Admin
export const getPostsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const posts = await Post.find({ status: status || 'pending' })
        .populate('createdBy', 'name email trustScore')
        .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Approve a post
// @route   PUT /admin/posts/:id/approve
// @access  Private/Admin
export const approvePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.status === 'approved') {
      return res.status(400).json({ message: 'Post is already approved' });
    }

    // Use updateOne to bypass full schema validation which sometimes causes 500s on legacy data
    await Post.updateOne({ _id: post._id }, { $set: { status: 'approved', isSuspicious: false } });

    // Reward author with +10 trust score
    if (post.createdBy) {
      await User.updateOne({ _id: post.createdBy }, { $inc: { trustScore: 10 } });
    }

    const updatedPost = await Post.findById(post._id);

    // Notify listeners that a post has been approved and is now live locally
    if (req.io) {
      req.io.emit('post_approved', updatedPost);
    }

    res.json({ message: 'Post approved successfully', post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Reject a post
// @route   PUT /admin/posts/:id/reject
// @access  Private/Admin
export const rejectPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.status === 'rejected') {
      return res.status(400).json({ message: 'Post is already rejected' });
    }

    // Partial update to avoid validation
    await Post.updateOne({ _id: post._id }, { $set: { status: 'rejected' } });

    // Penalize author with -15 trust score
    if (post.createdBy) {
      await User.updateOne({ _id: post.createdBy }, { $inc: { trustScore: -15 } });
    }

    const updatedPost = await Post.findById(post._id);

    res.json({ message: 'Post rejected successfully', post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reported posts with report counts
// @route   GET /admin/posts/reported
// @access  Private/Admin
export const getReportedPosts = async (req, res) => {
  try {
    const reports = await Report.aggregate([
      { $group: { _id: '$postId', count: { $sum: 1 }, reasons: { $push: '$reason' } } },
      { $sort: { count: -1 } }
    ]);

    const postIds = reports.map(r => r._id);
    const posts = await Post.find({ _id: { $in: postIds } })
      .populate('createdBy', 'name email trustScore isBlocked');

    const result = posts.map(post => {
      const reportData = reports.find(r => r._id.toString() === post._id.toString());
      return { ...post.toObject(), reportCount: reportData?.count || 0, reportReasons: reportData?.reasons || [] };
    }).sort((a, b) => b.reportCount - a.reportCount);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Block a user
// @route   PUT /admin/users/:id/block
// @access  Private/Admin
export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot block an admin' });

    await User.updateOne({ _id: user._id }, { $set: { isBlocked: true } });
    res.json({ message: `User ${user.name} has been blocked.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
