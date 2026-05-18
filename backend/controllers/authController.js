import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Compute trust badge from score
const getTrustBadge = (score) => {
  if (score >= 81) return 'Highly Trusted';
  if (score >= 61) return 'Trusted';
  return 'New';
};

const userPayload = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  trustScore: user.trustScore,
  trustBadge: getTrustBadge(user.trustScore),
  avatar: user.avatar || null,
  token,
});

// @desc    Register a new user
// @route   POST /auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json(userPayload(user, generateToken(user._id)));
    } else {
      res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      if (user.isBlocked) return res.status(403).json({ message: 'This account is blocked by the administrator.' });
      res.json(userPayload(user, generateToken(user._id)));
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
