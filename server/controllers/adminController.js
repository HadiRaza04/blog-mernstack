import Post from '../models/Post.js';
import User from '../models/User.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const totalUsers = await User.countDocuments({ isAdmin: false });
    
    // Sum of all views across all posts
    const viewsData = await Post.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    // Get count of published vs drafts
    const publishedCount = await Post.countDocuments({ isPublished: true });
    const draftCount = await Post.countDocuments({ isPublished: false });

    // Top 5 most liked posts
    const topPosts = await Post.find({})
      .sort({ "likes.length": -1 })
      .limit(5)
      .select('title views likes');

    res.json({
      totalPosts,
      totalUsers,
      totalViews: viewsData[0]?.totalViews || 0,
      publishedCount,
      draftCount,
      topPosts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all drafts (Unpublished blogs)
// @route   GET /api/admin/drafts
export const getDrafts = async (req, res) => {
  try {
    const drafts = await Post.find({ isPublished: false })
      .sort({ createdAt: -1 })
      .populate('user', 'name');
    res.json(drafts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};