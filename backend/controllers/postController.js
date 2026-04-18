import Post from '../models/Post.js';
import User from '../models/User.js';

// Simple Spam Detection Helper
const checkSuspicious = (text) => {
  const spamKeywords = ['earn fast', 'no work', 'high salary', 'quick money', 'lotto'];
  const lowercaseText = text.toLowerCase();
  
  // Check for keywords
  const hasSpamKeywords = spamKeywords.some(keyword => lowercaseText.includes(keyword));
  
  // Check for too many links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links = text.match(urlRegex);
  const tooManyLinks = links && links.length > 2;

  return hasSpamKeywords || tooManyLinks;
};

// @desc    Create a new post
// @route   POST /posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, radius, contact, expiryDate } = req.body;

    const isSuspicious = checkSuspicious(title + " " + description);

    const post = await Post.create({
      title,
      description,
      category,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude] // GeoJSON format: [lng, lat]
      },
      radius,
      contact,
      expiryDate,
      isSuspicious,
      createdBy: req.user._id,
      status: 'pending' // Default status per requirements
    });

    // Notify admins (Socket.io) about new pending post
    if (req.io) {
       req.io.emit('new_pending_post', post);
    }

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get nearby approved posts
// @route   GET /posts?lat=&lng=&radius=&category=
// @access  Public
export const getNearbyPosts = async (req, res) => {
  try {
    const { lat, lng, radius = 5000, category } = req.query; // default 5km

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and Longitude are required' });
    }

    const query = {
      status: 'approved',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) // in meters
        }
      }
    };

    if (category) {
      query.category = category;
    }

    // Filter out expired posts
    query.expiryDate = { $gte: new Date() };

    const posts = await Post.find(query)
      .populate('createdBy', 'name trustScore')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get post by ID
// @route   GET /posts/:id
// @access  Public
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
        .populate('createdBy', 'name trustScore');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
