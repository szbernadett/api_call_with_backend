let createError = require("http-errors");
let express = require("express");
let path = require("path");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI;

let server = express();
server.use(express.json());
server.use(cookieParser());

// Disable X-Powered-By header for security
server.disable("x-powered-by");

// Configure CORS with credentials
server.use(cors({
  origin: "https://api-call-with-backend.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Configure session
server.use(session({
  secret: process.env.SESSION_SECRET || "session-secret-key",
  name: "sessionId", // Custom name instead of default
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure in production
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax', // Important for cross-site requests
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const citiesRouter = require("./routes/cities");
let authRouter = require("./routes/auth");
const adminRouter = require('./routes/admin');




server.use("/", indexRouter);
server.use("/users", usersRouter);
server.use("/auth", authRouter);
server.use("/cities", citiesRouter);
server.use('/api/admin', adminRouter);

// catch 404 and forward to error handler
server.use(function(req, res, next) {
  next(createError(404));
});

// error handler
server.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {}
  });
});

module.exports = server;




