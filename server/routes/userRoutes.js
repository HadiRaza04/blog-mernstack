import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updateUserName,
  updateProfileLikes,
  getAllUsers,
  updateUserRole,
  getProfile
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const userRouter = express.Router();

// api/auth

// Public
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// Email Verification
userRouter.get('/verify/:token', verifyEmail);
userRouter.get('/users', protect, admin, getAllUsers);
userRouter.put('/update-user-role/:id', protect, admin, updateUserRole);


// Password Management
userRouter.post('/forgotpassword', forgotPassword);
userRouter.put('/resetpassword/:token', resetPassword);

// Private (Requires Token)
userRouter.put('/profile/like/:id', protect, updateProfileLikes);
// userRouter.get('/profile', protect, getUserProfile);
userRouter.get('/profile', protect, getProfile);
userRouter.put('/update', protect, updateUserProfile);

export default userRouter;