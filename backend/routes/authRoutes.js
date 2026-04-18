import express from 'express';
import passport from 'passport';
import { registerUser, loginUser } from '../controllers/authController.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// ── Google OAuth ──────────────────────────────────────────────
// Step 1: redirect to Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
  prompt: 'select_account',
}));

// Step 2: Google callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login?error=google_failed' }),
  (req, res) => {
    const user = req.user;
    const token = generateToken(user._id);

    const userData = encodeURIComponent(JSON.stringify({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      trustScore: user.trustScore,
      avatar: user.avatar,
      token,
    }));

    const frontendUrl = 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?user=${userData}`);
  }
);

export default router;
