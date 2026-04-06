import User from "../models/User.js";
import Post from "../models/Post.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../env.js";
import crypto from "crypto"; // Built-in Node module for tokens
import nodemailer from 'nodemailer';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post) {
      // Check if user already liked the post
      const alreadyLiked = post.likes.find(
        (id) => id.toString() === req.user._id.toString(),
      );
      if (alreadyLiked) {
        // Unlike: Remove user ID from likes array
        post.likes = post.likes.filter(
          (id) => id.toString() !== req.user._id.toString(),
        );
      } else {
        // Like: Add user ID to likes array
        post.likes.push(req.user._id);
      }
      await post.save();
      res.json({ likes: post.likes.length, isLiked: !alreadyLiked });
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const likePost = async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     const user = await User.findById(req.user._id);

//     if (!post) return res.status(404).json({ message: "Post not found" });

//     // Agar user ne pehle se like kiya hai to remove (Unlike) karein
//     if (post.likes.includes(req.user._id)) {
//       post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
//       user.likedPosts = user.likedPosts.filter(id => id.toString() !== post._id.toString());
//     } else {
//       // Warna like list mein add karein
//       post.likes.push(req.user._id);
//       user.likedPosts.push(post._id);
//     }

//     await post.save();
//     await user.save();

//     res.json({
//       message: "Success",
//       likesCount: post.likes.length,
//       isLiked: post.likes.includes(req.user._id)
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// @desc    Update user role (Admin/User toggle)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Toggle role: Agar true hai to false, agar false hai to true
      user.isAdmin = !user.isAdmin;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        isAdmin: updatedUser.isAdmin,
        message: `User role updated to ${updatedUser.isAdmin ? "Admin" : "User"}`,
      });
    } else {
      res.status(404).json({ message: "User nahi mila" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const user = new User({ name, email, password, verificationToken });
    await user.save();

    return res.status(201).json({ success: true, message: "User created." });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user)
    return res.status(400).json({ success: false, message: "User not found." });

  if (user && (await user.matchPassword(password))) {
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    return res.status(401).json({ message: "Invalid email or password" });
  }
};

// @desc    Get user profile
// export const getUserProfile = async (req, res) => {
//   const user = await User.findById(req.user._id).populate('bookmarks');
//   if (user) {
//     res.json(user);
//   } else {
//     res.status(404).json({ message: 'User not found' });
//   }
// };

export const updateProfileLikes = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User nahi mila" });

    // Check: Kya ye post pehle se liked list mein hai?
    const index = user.likedPosts.indexOf(postId);

    if (index > -1) {
      // Agar hai, to nikal do (Unlike)
      user.likedPosts.splice(index, 1);
    } else {
      // Agar nahi hai, to add kar do (Like)
      user.likedPosts.push(postId);
    }

    await user.save();
    res.json({ success: true, message: "User profile updated" });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error updating profile likes: ${error.message}` });
  }
};

// export const updateProfileLikes = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const postId = req.params.id;

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User nahi mila" });

//     // Ensure likedPosts array initialized hai (safety check)
//     if (!user.likedPosts) {
//       user.likedPosts = [];
//     }

//     // Check: Kya ye post ID pehle se likedPosts array mein hai?
//     // .some() use karna zyada behtar hai ObjectId comparison ke liye
//     const isAlreadyLiked = user.likedPosts.some(
//       (id) => id.toString() === postId.toString()
//     );

//     if (isAlreadyLiked) {
//       // --- UNLIKE ---
//       // Agar ID hai, to use filter karke nikal do
//       user.likedPosts = user.likedPosts.filter(
//         (id) => id.toString() !== postId.toString()
//       );
//     } else {
//       // --- LIKE ---
//       // Agar ID nahi hai, to push kar do
//       user.likedPosts.push(postId);
//     }

//     // save() karne se model updates database mein chali jayengi
//     await user.save();

//     res.json({
//       success: true,
//       message: isAlreadyLiked ? "Removed from Liked Posts" : "Added to Liked Posts",
//       count: user.likedPosts.length
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: `Error updating profile likes: ${error.message}`
//     });
//   }
// };

export const getMyComments = async (req, res) => {
  try {
    // ID seedha token se aa rahi hai (via protect middleware)
    const userId = req.user._id;

    // 1. Un saare posts ko dhundein jin par is user ne comment kiya hai
    const posts = await Post.find({ "comments.user": userId }).select(
      "title comments",
    );

    let myComments = [];

    // 2. Loop chala kar sirf is user ke comments filter karein
    posts.forEach((post) => {
      post.comments.forEach((comment) => {
        if (comment.user.toString() === userId.toString()) {
          myComments.push({
            commentId: comment._id,
            commentContent: comment.content,
            postTitle: post.title,
            postId: post._id,
            createdAt: comment.createdAt,
          });
        }
      });
    });

    // 3. Newest comments pehle dikhane ke liye sort karein
    myComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(myComments);
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    // 1. User find karein aur liked posts ke titles populate karein
    const user = await User.findById(req.user._id).populate(
      "likedPosts",
      "title",
    );

    // 2. Wo saare posts dhundein jin par is user ne comment kiya hai
    // Hum query kar rahe hain: "posts where comments.user matches this ID"
    const postsWithMyComments = await Post.find({
      "comments.user": req.user._id,
    }).select("title comments"); // Sirf title aur comments uthayein

    // 3. Har post se sirf is user ke specific comments nikal kar ek array banayein
    let userComments = [];
    postsWithMyComments.forEach((post) => {
      const myComments = post.comments.filter(
        (c) => c.user.toString() === req.user._id.toString(),
      );
      myComments.forEach((c) => {
        userComments.push({
          content: c.content,
          postTitle: post.title,
          postId: post._id,
          createdAt: c.createdAt,
        });
      });
    });
    console.log(user.likedPosts);

    res.json({
      user: {
        name: user.name,
        email: user.email,
        likedPosts: user.likedPosts,
      },
      comments: userComments, // Array of user's specific comments with post titles
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user profile with liked posts and comments
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    // 1. User find karein aur 'likedPosts' ko populate karein taake titles mil sakein
    const user = await User.findById(req.user._id)
      .select("-password") // Security: password mat bhejein
      .populate("likedPosts", "title"); // Sirf title chahiye card ke liye

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. User ke saare comments fetch karein (Poore Posts collection mein scan karke)
    const posts = await Post.find({ "comments.user": req.user._id }).select(
      "title comments",
    );

    let userComments = [];
    posts.forEach((post) => {
      post.comments.forEach((comment) => {
        if (comment.user.toString() === req.user._id.toString()) {
          userComments.push({
            content: comment.content,
            postTitle: post.title, // Frontend par yahi use ho raha hai
            createdAt: comment.createdAt,
          });
        }
      });
    });

    // 3. Newest comments sab se upar dikhane ke liye sort karein
    userComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Frontend ki demand ke mutabiq object return karein
    res.json({
      user,
      comments: userComments,
    });
  } catch (error) {
    res.status(500).json({ message: "Profile error: " + error.message });
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
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Verify Email
// @route   GET /api/users/verify/:token
export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Clear token after use
    await user.save();

    res.json({ message: "Email verified successfully! You can now login." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password - Generate Token
// @route   POST /api/users/forgotpassword
export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({ message: "No user found with that email" });
  }

  // Generate Reset Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash and set to user field
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 Minutes expiry

  await user.save();

  // URL for frontend: http://localhost:3000/resetpassword/TOKEN
  const resetUrl = `${req.protocol}://${req.get("host")}/api/users/resetpassword/${resetToken}`;

  try {
    // TODO: Send Email using Nodemailer here with resetUrl
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: email_user,
        pass: email_pass,
      },
    });
    const mailOptions = {
      to: user.email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Please click on this link: \n\n ${resetUrl}`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: "Token generated (Check console/logs)", resetUrl });
    console.log(`Reset URL: ${resetUrl}`);
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ message: "Email could not be sent" });
  }
};

export const resetPassword = async (req, res) => {
    try {
        // 1. Get the hashed version of the token from the URL
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        // 2. Find user with matching token AND ensure token hasn't expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() } // $gt means "Greater Than"
        });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token." });
        }

        // 3. Set the new password
        // Note: If you have a 'pre-save' hook for hashing in your Schema, 
        // just set user.password = req.body.password.
        // Otherwise, hash it manually here:
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        // 4. Clear the reset fields so the token can't be used again
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Password reset successful! You can now log in." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// export const resetPassword = async (req, res) => {
//   const resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(req.params.token)
//     .digest("hex");

//   const user = await User.findOne({
//     resetPasswordToken,
//     resetPasswordExpire: { $gt: Date.now() },
//   });

//   if (!user) {
//     return res.status(400).json({ message: "Invalid or expired token" });
//   }

//   // Set new password
//   user.password = req.body.password;
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpire = undefined;

//   await user.save();
//   res.json({ message: "Password reset successful" });
// };

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
      message: "Profile updated successfully",
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};
