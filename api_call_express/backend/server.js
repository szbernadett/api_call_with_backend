let createError = require("http-errors");
let express = require("express");
let path = require("path");
require("dotenv").config();
const cors = require("cors"); // Import cors
const PORT = process.env.PORT || 5000;

let server = express();
server.use(express.json());
server.use(cors({origin: "http://localhost:3000", // Allow frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow these methods
  credentials: true,})); // Enable CORS for all requests

let indexRouter = require("./routes/index");
let usersRouter = require("./routes/users");
let citiesRouter = require("./routes/cities");

// view engine setup
server.set("views", path.join(__dirname, "views"));
server.set("view engine", "hbs");

server.use(express.json());
server.use(express.urlencoded({ extended: false }));
server.use(express.static(path.join(__dirname, "public")));

server.use("/", indexRouter);
server.use("/users", usersRouter);
server.use("/cities", citiesRouter);

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

server.listen(5000, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;
