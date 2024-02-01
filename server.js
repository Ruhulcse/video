const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const db = require("./db/db");
const logger = require("morgan");
const helmet = require("helmet");
const routes = require("./routes");
const auth = require("./middlewares/auth");
const errorHandler = require("./middlewares/errors");
const cors = require("cors");
const uuid = require("uuid");
const { lookup } = require("geoip-lite");

require("./helpers/create_admin");
require("dotenv").config();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/api", auth.authorize);
app.use(logger("dev"));
app.use(helmet());
app.use(routes);
app.use("/public", express.static("public"));

app.use(errorHandler);

app.get("/", function (req, res) {
  const ipAddress = req.socket.remoteAddress;
  console.log(ipAddress);
  // console.log(lookup(ipAddress)); // location of the user
  // Check if the visitorId cookie exists
  if (req.cookies.visitorId) {
    console.log("Returning visitor with ID:", req.cookies.visitorId);
    res.send("Welcome back, visitor!");
  } else {
    // Assign a unique ID and set it in a cookie
    const visitorId = uuid.v4();
    res.cookie("visitorId", visitorId, { maxAge: 24 * 60 * 60 * 1000 }); // Expires in 1 day
    console.log("New visitor assigned ID:", visitorId);
    res.send("Hello, new visitor!");
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server listening :${PORT}`);
});

module.exports = app;
