import Post from '../models/Post.js';
import { cloudinary } from '../config/cloudinary.js';

// @desc    Fetch all posts (with optional search/category filter)
// export const getPosts = async (req, res) => {
//   const keyword = req.query.keyword ? {
//     title: { $regex: req.query.keyword, $options: 'i' }
//   } : {};

//   const category = req.query.category ? { category: req.query.category } : {};

//   try {
//     const posts = await Post.find({ ...keyword, ...category, isPublished: true })
//       .sort({ createdAt: -1 });
//     res.json(posts);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Update your existing getPosts to check if requester is Admin
export const getPosts = async (req, res) => {
  try {
    // If there is a query 'all=true' and user is admin, show all
    const isAdminRequest = req.query.all === 'true';
    const query = isAdminRequest ? {} : { isPublished: true };

    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/postController.js
export const getPostsByQuery = async (req, res) => {
  const { category } = req.query; // Query se category uthayein
  try {
    let query = { isPublished: true };
    if (category && category !== 'All') {
      query.category = category;
    }
    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle Publish Status
export const togglePostStatus = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    post.isPublished = !post.isPublished;
    const updatedPost = await post.save();
    res.json(updatedPost);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
};

// @desc    Fetch single post by ID
export const getPostById = async (req, res) => {
  const post = await Post.findById(req.params.id).populate('user', 'name');
  if (post) {
    post.views += 1; // Increment view count
    await post.save();
    res.json(post);
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
};

// @desc    Create a post (Admin Only)
// export const createPost = async (req, res) => {
//   const { title, content, image, category, isPublished } = req.body;
  
//   const post = new Post({
//     user: req.user._id,
//     title,
//     content,
//     image,
//     category,
//     isPublished
//   });

//   const createdPost = await post.save();
//   res.status(201).json(createdPost);
// };
// @desc    Create a post (Admin Only)
export const createPost = async (req, res) => {
  try {
    const { title, content, category, isPublished } = req.body;

    // Extract URLs from the uploaded files
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    if (imageUrls.length > 5) {
      return res.status(400).json({ message: "You can only upload up to 5 images." });
    }

    const post = new Post({
      user: req.user._id,
      title,
      content,
      images: imageUrls, // Saving the array of URLs
      category,
      isPublished
    });

    const createdPost = await post.save();
    res.status(201).json(createdPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update post (Admin Only)
// export const updatePost = async (req, res) => {
//   const { title, content, image, category, isPublished } = req.body;
//   const post = await Post.findById(req.params.id);

//   if (post) {
//     post.title = title || post.title;
//     post.content = content || post.content;
//     post.image = image || post.image;
//     post.category = category || post.category;
//     post.isPublished = isPublished !== undefined ? isPublished : post.isPublished;

//     const updatedPost = await post.save();
//     res.json(updatedPost);
//   } else {
//     res.status(404).json({ message: 'Post not found' });
//   }
// };

// @desc    Update post (Admin Only)
// @route   PUT /api/posts/:id
export const updatePost = async (req, res) => {
  try {
    const { title, content, category, isPublished } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // 1. Handle Image Updates
    if (req.files && req.files.length > 0) {
      // Logic: If new images are uploaded, delete old ones from Cloudinary first
      if (post.images && post.images.length > 0) {
        for (const imageUrl of post.images) {
          // Extract Public ID from the URL to delete from Cloudinary
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`blog_images/${publicId}`);
        }
      }

      // Map the new uploaded file paths
      post.images = req.files.map(file => file.path);
    }

    // 2. Update Text Fields
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.isPublished = isPublished !== undefined ? isPublished : post.isPublished;

    const updatedPost = await post.save();
    res.json(updatedPost);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete post (Admin Only)
export const deletePost = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    await post.deleteOne();
    res.json({ message: 'Post removed successfully' });
  } else {
    res.status(404).json({ message: 'Post not found' });
  }
};


// @desc    Like / Unlike a post
// @route   POST /api/posts/:id/like
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      // Check if user already liked the post
      const alreadyLiked = post.likes.find(
        (id) => id.toString() === req.user._id.toString()
      );

      if (alreadyLiked) {
        // Unlike: Remove user ID from likes array
        post.likes = post.likes.filter(
          (id) => id.toString() !== req.user._id.toString()
        );
      } else {
        // Like: Add user ID to likes array
        post.likes.push(req.user._id);
      }

      await post.save();
      res.json({ likes: post.likes.length, isLiked: !alreadyLiked });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment
// @route   POST /api/posts/:id/comment
export const addComment = async (req, res) => {
  const { content } = req.body;

  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      const comment = {
        user: req.user._id,
        name: req.user.name,
        content,
      };

      post.comments.push(comment);
      await post.save();
      res.status(201).json({ message: 'Comment added', comments: post.comments });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/posts/:postId/comments/:commentId
export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (post) {
      const comment = post.comments.id(req.params.commentId);

      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      // Check if user is the owner of the comment OR an admin
      if (comment.user.toString() === req.user._id.toString() || req.user.isAdmin) {
        comment.deleteOne();
        await post.save();
        res.json({ message: 'Comment removed' });
      } else {
        res.status(401).json({ message: 'User not authorized' });
      }
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};