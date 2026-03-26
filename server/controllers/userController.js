import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../env.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'; // Built-in Node module for tokens


const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};



// @desc    Register new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = new User({ name, email, password });
    await user.save();
    
    return res.status(201).json({ success: true, message: "User created."})
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message})
  }
  
};

// @desc    Auth user & get token
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if(!user) return res.status(400).json({ success: false, message: "User not found."})


  if (user && (await user.matchPassword(password))) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Get user profile
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('bookmarks');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
export const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};


// @desc    Verify Email
// @route   GET /api/users/verify/:token
export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Clear token after use
    await user.save();

    res.json({ message: 'Email verified successfully! You can now login.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password - Generate Token
// @route   POST /api/users/forgotpassword
export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: 'No user found with that email' });
  }

  // Generate Reset Token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash and set to user field
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes expiry

  await user.save();

  // URL for frontend: http://localhost:3000/resetpassword/TOKEN
  const resetUrl = `${req.protocol}://${req.get('host')}/api/users/resetpassword/${resetToken}`;

  try {
    // TODO: Send Email using Nodemailer here with resetUrl
    res.json({ message: 'Token generated (Check console/logs)', resetUrl });
    console.log(`Reset URL: ${resetUrl}`);
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ message: 'Email could not be sent' });
  }
};

export const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  res.json({ message: 'Password reset successful' });
};

// @desc    Change Name (Update Profile)
// @route   PUT /api/users/profile
export const updateUserName = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    // You can also add user.email = req.body.email if you want to allow email changes
    
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      message: 'Profile updated successfully'
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};