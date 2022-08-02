"use strict";

// Load environment variables
require("dotenv").config({ path: "./config/.env" });
// Load required modules
const express = require("express");
const expressSession = require("express-session");
const pgSession = require("connect-pg-simple")(expressSession);
const db = require("./config/database.js");
const httpRedirect = require("./middleware/httpRedirect.js");
const nocache = require("nocache");
const helmet = require("helmet");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportConfig = require("./config/passport.js");
const apiRouter = require("./routes/index.js")
const errorHandler = require("./middleware/errorHandler.js");
const notFound = require("./middleware/notFound.js");

// App variables
const app = express();
const env = app.get("env");

// Session configuration
const session = {
  name: "sessionId",
  secret: process.env.SESSION_SECRET,
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 3600000,
    secure: false,
    sameSite: 'strict'
  },
  resave: false,
  saveUninitialized: false,
  store: new pgSession({ pool: db.pool })
};

// Configuration for production environment
if (env === "production") {
  app.set('trust proxy', 1); // trust first proxy
  app.use(httpRedirect); // set up HTTP redirect to HTTPS
  session.cookie.secure = true;   // serve cookies over HTTPS only
}

/*
*
*  App configuration
*
*/

// Remove Express fingerprinting HTTP header
app.disable("x-powered-by");

// Serve static files from public directory
app.use(express.static("public"));

// Disable resource caching
app.use(nocache());

// Set security related HTTP headers
app.use(helmet(require("./config/helmet.js")));

// Parse incoming JSON request body
app.use(express.json());

// Set up session management
app.use(expressSession(session));

// Set up passport authentication mechanism
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" }, passportConfig.verifyUser));
passport.serializeUser(passportConfig.serializeUser);
passport.deserializeUser(passportConfig.deserializeUser);

/* 
*
*
*/

// Api routes
app.use("/api", apiRouter);
app.use(notFound);

// Error handling
app.use(errorHandler);

module.exports = app;