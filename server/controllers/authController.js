const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isProd = process.env.NODE_ENV === 'production';
const JWT_SECRET = process.env.JWT_SECRET;
if (isProd && !JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}

// POST /api/auth/verify-otp
// Body: { phone, otp, mode: 'login'|'signup', name? }
exports.verifyOTP = async (req, res) => {
  const { phone, otp, mode, name } = req.body;
  if (!phone || !otp){ 
    return res.status(400).json({ 
      message: 'Phone and OTP required' 
    });
  }
  if (!mode){ 
    return res.status(400).json({ 
      message: 'Mode (login/signup) is required' 
    });
  }

  // Mock OTP — production must use a real provider.
  if (otp !== '1234'){ 
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid OTP. Please try again.' 
    });
  }

  try {
    let user = await User.findOne({ phoneNumber: phone });

    if (mode === 'login') {
      // ── LOGIN FLOW ──────────────────────────────────────────────────────────
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found for this number. Please sign up first.'
        });
      }
    } else if (mode === 'signup') {
      // ── SIGNUP FLOW ─────────────────────────────────────────────────────────
      if (user) {
        return res.status(409).json({
          success: false,
          message: 'This number is already registered. Please sign in.'
        });
      }
      if (!name || !name.trim()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name is required to sign up.' 
        });
      }
      user = await User.create({ phoneNumber: phone, name: name.trim(), role: 'USER' });
    } else {
      return res.status(400).json({ 
        message: 'Invalid mode. Use login or signup.' 
      });
    }

    const token = jwt.sign(
      { role: user.role, phoneNumber: user.phoneNumber, userId: user._id },
      JWT_SECRET || 'hotel-mock-secret',
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: { phoneNumber: user.phoneNumber, name: user.name, role: user.role }
    });
  } catch (err) {
    console.error('[verifyOTP] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// GET /api/auth/me  (requires auth header)
exports.getMe = async (req, res) => {
  try {
    if (req.user && req.user.role === 'ADMIN') {
      return res.json({ role: 'ADMIN', username: req.user.username });
    }
    const user = await User.findOne({ phoneNumber: req.user.phoneNumber }).select('-__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ phoneNumber: user.phoneNumber, name: user.name, role: user.role, createdAt: user.createdAt });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/auth/me  (update name)
exports.updateMe = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const user = await User.findOneAndUpdate(
      { phoneNumber: req.user.phoneNumber },
      { name },
      { new: true }
    );
    res.json({ phoneNumber: user.phoneNumber, name: user.name, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/admin-login
exports.adminLogin = (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER;
  const adminPass = process.env.ADMIN_PASS;

  if (isProd && (!adminUser || !adminPass)) {
    return res.status(503).json({ 
      success: false, 
      message: 'Admin auth not configured' 
    });
  }

  if (username === adminUser && password === adminPass) {
    const token = jwt.sign({ role: 'ADMIN', username }, JWT_SECRET || 'hotel-mock-secret', { expiresIn: '24h' });
    return res.json({ success: true, token });
  }

  res.status(401).json({ success: false, message: 'Invalid admin credentials' });
};
