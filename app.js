const express = require("express");
const expressSession = require("express-session");
const pgSession = require("connect-pg-simple")(expressSession);
const db = require("./config/database.js");
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

if (env === "production") {
  // Cookies must be served over HTTPS in production
  session.cookie.secure = true;
}

// App configuration
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json());
app.use(expressSession(session));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" }, passportConfig.verifyUser));
passport.serializeUser(passportConfig.serializeUser);
passport.deserializeUser(passportConfig.deserializeUser);

// Api routes
app.use("/api", apiRouter);
app.use(notFound);

// Error handling
app.use(errorHandler);

module.exports = app;