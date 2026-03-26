import express from 'express';
import { getDashboardStats, getDrafts } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const adminRouter = express.Router();

// All routes here are restricted to Admins
adminRouter.use(protect); // Ensure logged in
adminRouter.use(admin);   // Ensure role is admin

// @route   GET /api/admin/stats
adminRouter.get('/stats', getDashboardStats);

// @route   GET /api/admin/drafts
adminRouter.get('/drafts', getDrafts);

export default adminRouter;