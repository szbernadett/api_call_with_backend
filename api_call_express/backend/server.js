let createError = require("http-errors");
let express = require("express");
let path = require("path");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5000;
const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI;

let server = express();
server.use(express.json());
server.use(cookieParser()); // Add cookie parser
server.use(cors({
  origin: true, // Allow all origins temporarily for testing
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// Add a preflight handler for all routes
server.options('*', cors());

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
