// LOCAL


// const express = require("express");
// const session = require("express-session");
// const bodyParser = require("body-parser");
// const passport = require("./config/passport");
// const mongoose = require("mongoose");
// const path = require("path");
// const cors = require("cors");
// const Admin = require("./models/Admin");
// const User = require("./models/User");
// const adminRoutes = require("./routes/adminRoutes");
// const authRoutes = require("./routes/authRoutes");
// const postRoutes = require("./routes/postRoutes");
// const userRoutes = require("./routes/userRoutes");
// const port = 3000;

// const app = express();

// async function main() {
//   try {//mongodb://localhost:27017/
//     // await mongoose.connect("mongodb://localhost:27017/first");
//     // console.log("Database connected successfully");

//     await mongoose.connect("mongodb://localhost:27017/first");
//     console.log("Database connected successfully");
//   } catch (error) {
//     console.error("Database connection error:", error);
//   }
// }


//   main().then(()=>{
//     console.log("db connect")
//   }).catch(err=>console.log(err))
// // MongoDB connection setup
// // const mongoURI = "mongodb://localhost:27017/test1"; // Replace with your MongoDB URI
// // mongoose
// //   .connect(mongoURI, {
// //     useNewUrlParser: true,
// //     useUnifiedTopology: true,
// //   })
// //   .then(() => {
// //     console.log("MongoDB connected");
// //   })
// //   .catch((err) => {
// //     console.error("MongoDB connection error:", err);
// //   });

// // View engine setup (EJS)
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "/views"));

// // CORS configuration for cross-origin requests
// app.use(
//   cors({
//     origin: [
//       "http://localhost:3001",
//       "http://localhost:3000",
//       "http://192.168.57.159:3001",
//       "http://192.168.57.159:3000",
//     ],
//     credentials: true, // Allow credentials in requests
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "Accept"],
//   })
// );

// // Middleware configuration for parsing JSON and form data
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(express.static("public"));

// // Session middleware setup
// app.use(
//   session({
//     secret: "your-secret-key",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: false, // Set to true if using HTTPS
//       httpOnly: true,
//       maxAge: 24 * 60 * 60 * 1000, // 24 hours
     
//     },
//   })
// );

// // Passport initialization
// app.use(passport.initialize());
// app.use(passport.session());
// app.get("/",(req,res)=>{
//   res.send("helo");
// })
// // Routes configuration
// app.use("/admin", adminRoutes); // Admin routes
// app.use("/auth", authRoutes); // Authentication routes
// app.use("/auth/posts", postRoutes); // Post routes
// app.use("/auth/users", userRoutes); // User routes

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Error:", err.stack); // Enhanced error logging
//   res.status(500).json({
//     message: "Something broke! Please try again later.",
//     error: err.message,
//   });
// });

// // 404 Error handling for undefined routes
// app.use((req, res) => {
//   console.log("404 Not Found:", req.method, req.url); // Detailed logging for 404s
//   res.status(404).json({
//     message: "Route not found",
//     path: req.url,
//     method: req.method,
//   });
// });

// // Start server and log the port
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });



// ##################################################################################################################


const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo"); // You'll need to install this package
const bodyParser = require("body-parser");
const passport = require("./config/passport");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const Admin = require("./models/Admin");
const User = require("./models/User");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const bcrypt = require("bcryptjs"); 
const port = 3000;

const app = express();

// MongoDB connection setup
const mongoURI =
  "mongodb+srv://junaidshk2711:madmax1234@cluster0.ykcxw.mongodb.net/nagrik_seva?retryWrites=true&w=majority&appName=Cluster0";

  // mongodb+srv://junaidshk2711:madmax1234@cluster0.ykcxw.mongodb.net/nagrik_seva?retryWrites=true&w=majority

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: "majority",
  })
  .then(() => {
    console.log("Successfully connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("MongoDB Atlas connection error:", err);
  });

// View engine setup (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// CORS configuration for cross-origin requests
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3001",
        "http://localhost:3000",
        "http://192.168.57.159:3001",
        "http://192.168.57.159:3000",
      ];

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked origin:", origin);
        callback(new Error("Origin not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
      "User-Agent",
    ],
    exposedHeaders: ["set-cookie"],
    optionsSuccessStatus: 200,
  })
);

// Add this right after CORS middleware to debug requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  next();
});

// Middleware configuration for parsing JSON and form data
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));

// Enhanced Session middleware setup with MongoDB store
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoURI, // Use the same MongoDB connection
      collectionName: "sessions", // Name of the collection to store sessions
      ttl: 7 * 24 * 60 * 60, // 7 days (match with your current settings)
      autoRemove: "native", // Use MongoDB's TTL index
      touchAfter: 24 * 3600, // Refresh session only once per 24 hours for performance
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days to match your current settings
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      domain:
        process.env.NODE_ENV === "production" ? ".yourdomain.com" : undefined,
    },
    name: "sessionId", // Explicit session cookie name
    rolling: true, // Refresh session with each request
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Add session activity tracking middleware
app.use((req, res, next) => {
  if (req.session && req.isAuthenticated()) {
    // Update last activity time
    req.session.lastActivity = Date.now();

    // Extend session if needed
    if (req.session.cookie && req.session.cookie.maxAge) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Reset to 30 days
    }
  }
  next();
});

// Add this middleware to handle mobile clients
app.use((req, res, next) => {
  // Check if request is from mobile app
  const isMobileApp = req.headers["user-agent"]?.includes("ReactNative");

  if (isMobileApp) {
    // Extend session lifetime for mobile clients
    if (req.session) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days for mobile
    }
  }
  next();
});

// Routes configuration
app.use("/admin", adminRoutes); // Admin routes
app.use("/auth", authRoutes); // Authentication routes
app.use("/auth/posts", postRoutes); // Post routes
app.use("/auth/users", userRoutes); // User routes

// Session status endpoint (optional, for debugging)
app.get("/session-status", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user._id,
        role: req.user.role,
      },
      session: {
        lastActivity: req.session.lastActivity,
        cookie: {
          maxAge: req.session.cookie.maxAge,
        },
      },
    });
  } else {
    res.json({
      authenticated: false,
      session: req.session
        ? {
            id: req.session.id,
            cookie: {
              maxAge: req.session.cookie.maxAge,
            },
          }
        : null,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack); // Enhanced error logging
  res.status(500).json({
    message: "Something broke! Please try again later.",
    error: err.message,
  });
});

// 404 Error handling for undefined routes
app.use((req, res) => {
  console.log("404 Not Found:", req.method, req.url); // Detailed logging for 404s
  res.status(404).json({
    message: "Route not found",
    path: req.url,
    method: req.method,
  });
});

// Start server and log the port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;


//######################################################################################################################


//claude


// const express = require("express");
// const session = require("express-session");
// const MongoStore = require("connect-mongo");
// const bodyParser = require("body-parser");
// const passport = require("./config/passport");
// const mongoose = require("mongoose");
// const path = require("path");
// const cors = require("cors");
// require('dotenv').config(); // Add this to load environment variables

// const Admin = require("./models/Admin");
// const User = require("./models/User");
// const adminRoutes = require("./routes/adminRoutes");
// const authRoutes = require("./routes/authRoutes");
// const postRoutes = require("./routes/postRoutes");
// const userRoutes = require("./routes/userRoutes");
// const port = process.env.PORT || 3000;

// const app = express();

// // MongoDB connection setup - move this to environment variables
// const mongoURI = process.env.MONGODB_URI || "mongodb+srv://junaidshk2711:madmax1234@cluster0.ykcxw.mongodb.net/nagrik_seva?retryWrites=true&w=majority";

// mongoose
//   .connect(mongoURI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("Successfully connected to MongoDB Atlas");
//   })
//   .catch((err) => {
//     console.error("MongoDB Atlas connection error:", err);
//   });

// // View engine setup (EJS)
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "/views"));

// // CORS configuration for cross-origin requests
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       const allowedOrigins = [
//         "http://localhost:3001",
//         "http://localhost:3000",
//         "http://192.168.29.123:3001",
//         "http://192.168.29.123:3000",
//       ];

//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         console.log("Blocked origin:", origin);
//         callback(new Error("Origin not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//       "Accept",
//       "Origin",
//       "X-Requested-With",
//       "User-Agent",
//     ],
//     exposedHeaders: ["set-cookie"],
//     optionsSuccessStatus: 200,
//   })
// );

// // Middleware configuration for parsing JSON and form data
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(express.static(path.join(__dirname, "public")));

// // Create a strong session secret
// const sessionSecret = process.env.SESSION_SECRET || "my-secure-fallback-secret-key-for-development-only";

// // Enhanced Session middleware setup with MongoDB store
// app.use(
//   session({
//     secret: sessionSecret,
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//       mongoUrl: mongoURI,
//       collectionName: "sessions",
//       ttl: 7 * 24 * 60 * 60,
//       autoRemove: "native",
//       touchAfter: 24 * 3600,
//     }),
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       httpOnly: true,
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//       sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
//       path: "/",
//     },
//     name: "sessionId",
//     rolling: true,
//   })
// );

// // Passport initialization
// app.use(passport.initialize());
// app.use(passport.session());

// // Add session activity tracking middleware
// app.use((req, res, next) => {
//   if (req.session && req.isAuthenticated()) {
//     // Update last activity time
//     req.session.lastActivity = Date.now();
//   }
//   next();
// });

// // Add this middleware to handle mobile clients
// app.use((req, res, next) => {
//   // Check if request is from mobile app
//   const isMobileApp = req.headers["user-agent"]?.includes("ReactNative");

//   if (isMobileApp && req.session) {
//     // Extend session lifetime for mobile clients
//     req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days for mobile
//   }
//   next();
// });

// // Routes configuration
// app.use("/admin", adminRoutes);
// app.use("/auth", authRoutes);
// app.use("/posts", postRoutes); // Changed from /auth/posts to /posts
// app.use("/users", userRoutes); // Changed from /auth/users to /users

// // Session status endpoint (optional, for debugging)
// app.get("/session-status", (req, res) => {
//   if (req.isAuthenticated()) {
//     res.json({
//       authenticated: true,
//       user: {
//         id: req.user._id,
//         role: req.user.role,
//       },
//       session: {
//         lastActivity: req.session.lastActivity,
//         cookie: {
//           maxAge: req.session.cookie.maxAge,
//         },
//       },
//     });
//   } else {
//     res.json({
//       authenticated: false,
//       session: req.session
//         ? {
//             id: req.session.id,
//             cookie: {
//               maxAge: req.session.cookie.maxAge,
//             },
//           }
//         : null,
//     });
//   }
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Error:", err.stack);
  
//   // Don't expose error details in production
//   const errorMessage = process.env.NODE_ENV === 'production' 
//     ? 'Something went wrong' 
//     : err.message;
    
//   res.status(err.status || 500).json({
//     message: "Something broke! Please try again later.",
//     error: errorMessage,
//   });
// });

// // 404 Error handling for undefined routes
// app.use((req, res) => {
//   console.log("404 Not Found:", req.method, req.url);
//   res.status(404).json({
//     message: "Route not found",
//     path: req.url,
//     method: req.method,
//   });
// });

// // Start server and log the port
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// module.exports = app;




//##################################################################################




// const { MongoClient, ServerApiVersion } = require("mongodb");
// const uri =
//   "mongodb+srv://junaid1:madmax1@cluster0.ykcxw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);
