// const express = require("express");
// const router = express.Router();
// const Admin = require("../models/Admin");
// const { ensureAdmin } = require("../middleware/auth");
// const Post = require("../models/Post");
// const User = require("../models/User");
// const passport = require("passport");

// // Admin check route
// router.get("/check", async (req, res) => {
//   try {
//     if (!req.session.user || req.session.user.role !== "admin") {
//       return res.status(401).json({ message: "Not authenticated or not authorized" });
//     }
//     res.json({
//       user: req.session.user,
//     });
//   } catch (error) {
//     console.error("Auth check error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Admin login
// router.post("/login", (req, res, next) => {
//   passport.authenticate("admin", (err, admin, info) => {
//     if (err) {
//       return res.status(500).json({ message: "Login failed", error: err });
//     }

//     if (!admin) {
//       return res.status(401).json({ message: info.message || "Invalid credentials" });
//     }

//     req.login(admin, (err) => {
//       if (err) {
//         return res.status(500).json({ message: "Error saving session" });
//       }
//       res.json({
//         user: {
//           id: admin._id,
//           username: admin.username,
//           email: admin.email,
//           role: "admin",
//         },
//       });
//     });
//   })(req, res, next);
// });

// // Admin logout
// router.post("/logout", (req, res) => {
//   req.logout(() => {
//     res.json({ message: "Logged out successfully" });
//   });
// });

// // Get all reported posts (5+ reports)
// router.get("/reported-posts", ensureAdmin, async (req, res) => {
//   try {
//     const reportedPosts = await Post.find({ reportCount: { $gte: 5 } })
//       .populate("userId", "username")
//       .sort({ reportCount: -1 })
//       .lean(); // Convert to plain JavaScript objects

//     res.json({
//       posts: reportedPosts,
//       total: reportedPosts.length,
//     });
//   } catch (error) {
//     console.error("Error fetching reported posts:", error);
//     res.status(500).json({ message: "Error fetching reported posts" });
//   }
// });

// // Delete a post
// router.delete("/posts/:postId", ensureAdmin, async (req, res) => {
//   try {
//     const { postId } = req.params;
    
//     if (!postId || typeof postId !== 'string') {
//       return res.status(400).json({ message: "Invalid post ID" });
//     }

//     const deletedPost = await Post.findByIdAndDelete(postId);
    
//     if (!deletedPost) {
//       return res.status(404).json({ message: "Post not found" });
//     }
    
//     res.json({ message: "Post deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting post:", error);
//     res.status(500).json({ message: "Error deleting post" });
//   }
// });

// // Clear reports for a post
// router.post("/posts/:postId/clear-reports", ensureAdmin, async (req, res) => {
//   try {
//     const post = await Post.findByIdAndUpdate(
//       req.params.postId,
//       { $set: { reports: [], reportCount: 0 } },
//       { new: true }
//     );

//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     res.json({ message: "Reports cleared successfully", post });
//   } catch (error) {
//     console.error("Error clearing reports:", error);
//     res.status(500).json({ message: "Error clearing reports" });
//   }
// });

// // Get admin stats
// router.get("/stats", ensureAdmin, async (req, res) => {
//   try {
//     const [totalPosts, totalUsers] = await Promise.all([
//       Post.countDocuments(),
//       User.countDocuments(),
//     ]);

//     res.json({
//       totalPosts,
//       totalUsers,
//     });
//   } catch (error) {
//     console.error("Error fetching stats:", error);
//     res.status(500).json({ message: "Error fetching stats" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const { ensureAdmin } = require("../middleware/auth");
const Post = require("../models/Post");
const User = require("../models/User");
const passport = require("passport");

// Admin check route
// router.get("/check", async (req, res) => {
//   try {
//     if (!req.session.user || req.session.user.role !== "admin") {
//       return res.status(401).json({ message: "Not authenticated or not authorized" });
//     }
//     res.json({
//       user: req.session.user,
//     });
//   } catch (error) {
//     console.error("Auth check error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// Admin check route - revised
router.get("/check", (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    return res
      .status(401)
      .json({ message: "Not authenticated or not authorized" });
  }

  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// // Admin login
// router.post("/login", (req, res, next) => {
//   passport.authenticate("admin", (err, admin, info) => {
//     if (err) {
//       return res.status(500).json({ message: "Login failed", error: err });
//     }

//     if (!admin) {
//       return res.status(401).json({ message: info.message || "Invalid credentials" });
//     }

//     req.login(admin, (err) => {
//       if (err) {
//         return res.status(500).json({ message: "Error saving session" });
//       }
//       res.json({
//         user: {
//           id: admin._id,
//           username: admin.username,
//           email: admin.email,
//           role: "admin",
//         },
//       });
//     });
//   })(req, res, next);
// });

// new session
router.post("/login", (req, res, next) => {
  passport.authenticate("admin", (err, admin, info) => {
    if (err) {
      return res.status(500).json({ message: "Login failed", error: err });
    }

    if (!admin) {
      return res
        .status(401)
        .json({ message: info.message || "Invalid credentials" });
    }

    req.login(admin, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error saving session" });
      }

      // Don't set req.session.user manually when using Passport
      // Passport will handle this through serializeUser
      res.json({
        user: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: "admin",
        },
      });
    });
  })(req, res, next);
});

// Admin logout
router.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out successfully" });
  });
});

// Get all reported posts (5+ reports)
router.get("/reported-posts", ensureAdmin, async (req, res) => {
  try {
    const reportedPosts = await Post.find({ reportCount: { $gte: 5 } })
      .populate("userId", "username")
      .sort({ reportCount: -1 })
      .lean(); // Convert to plain JavaScript objects

    res.json({
      posts: reportedPosts,
      total: reportedPosts.length,
    });
  } catch (error) {
    console.error("Error fetching reported posts:", error);
    res.status(500).json({ message: "Error fetching reported posts" });
  }
});

//schedule
router.put("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { inQueue, queuedAt, scheduledDeletion } = req.body;

    const post = await Post.findByIdAndUpdate(
      id,
      {
        inQueue,
        queuedAt,
        scheduledDeletion,
        status: "queued",
      },
      { new: true }
    );

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // Schedule deletion after 7 days
    const deleteAfter = new Date(scheduledDeletion).getTime() - Date.now();
    setTimeout(async () => {
      try {
        await Post.findByIdAndDelete(id);
        console.log(`Post ${id} deleted successfully after 7 days`);
      } catch (error) {
        console.error(`Error deleting post ${id}:`, error);
      }
    }, deleteAfter);

    res.json({ success: true, post });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete a post
router.delete("/posts/:postId", ensureAdmin, async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId || typeof postId !== "string") {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post" });
  }
});

// Clear reports for a post
router.post("/posts/:postId/clear-reports", ensureAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $set: { reports: [], reportCount: 0 } },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json({ message: "Reports cleared successfully", post });
  } catch (error) {
    console.error("Error clearing reports:", error);
    res.status(500).json({ message: "Error clearing reports" });
  }
});

// Get admin stats
router.get("/stats", ensureAdmin, async (req, res) => {
  try {
    const [totalPosts, totalUsers] = await Promise.all([
      Post.countDocuments(),
      User.countDocuments(),
    ]);

    res.json({
      totalPosts,
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

module.exports = router;

