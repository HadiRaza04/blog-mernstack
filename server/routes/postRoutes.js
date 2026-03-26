import express from 'express';
import { 
  getPosts, 
  getPostById, 
  createPost, 
  updatePost, 
  deletePost,
  likePost,
  addComment,
  deleteComment,
  togglePostStatus
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import { upload } from '../config/cloudinary.js';

const postRouter = express.Router();

// Existing Routes
postRouter.get('/', getPosts);
postRouter.get('/:id', getPostById);
postRouter.post('/', protect, admin, upload.array('images', 5), createPost);
postRouter.put('/:id', protect, admin, upload.array('images', 5), updatePost);
postRouter.delete('/:id', protect, admin, deletePost);

// --- Engagement Routes ---
// Toggle Like
postRouter.post('/:id/like', protect, likePost);
postRouter.patch('/:id/status', protect, admin, togglePostStatus);

// Add Comment
postRouter.post('/:id/comment', protect, addComment);

// Delete Comment (Requires post ID and comment ID)
postRouter.delete('/:postId/comments/:commentId', protect, deleteComment);

export default postRouter;