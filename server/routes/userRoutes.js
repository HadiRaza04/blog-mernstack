import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateUserName
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

// Public
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// Email Verification
userRouter.get('/verify/:token', verifyEmail);

// Profile Management
userRouter.put('/profile', protect, updateUserName);

// Password Management
userRouter.post('/forgotpassword', forgotPassword);
userRouter.put('/resetpassword/:token', resetPassword);

// Private (Requires Token)
userRouter.get('/profile', protect, getUserProfile);
userRouter.put('/update', protect, updateUserProfile);

export default userRouter;