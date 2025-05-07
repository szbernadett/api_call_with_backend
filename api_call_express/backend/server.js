let createError = require("http-errors");
let express = require("express");
let path = require("path");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI;
const sanitizeMiddleware = require('./middleware/sanitise');

let server = express();
server.use(express.json());
server.use(cookieParser()); // Add cookie parser

// Apply sanitisation middleware globally
server.use(sanitizeMiddleware);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow any origin for now to troubleshoot
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
server.use(cors(corsOptions));

// Handle OPTIONS preflight requests
server.options('*', cors(corsOptions));

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

let indexRouter = require("./routes/index");
let usersRouter = require("./routes/users");
let citiesRouter = require("./routes/cities");
let authRouter = require("./routes/auth"); // Auth router
let adminRouter = require("./routes/admin"); // Admin router

// view engine setup
server.set("views", path.join(__dirname, "views"));
server.set("view engine", "hbs");

server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(express.static(path.join(__dirname, "public")));

server.use("/", indexRouter);
server.use("/users", usersRouter);
server.use("/cities", citiesRouter);
server.use("/auth", authRouter);
server.use("/admin", adminRouter); // Mount admin routes

// catch 404 and forward to error handler
server.use(function(req, res, next) {
  next(createError(404));
});

// error handler
server.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;
