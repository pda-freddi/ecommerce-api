// Required modules
require("dotenv").config();
const express = require("express");
const expressSession = require("express-session");
const pgSession = require("connect-pg-simple")(expressSession);
const passport = require("passport");
const LocalStrategy = require("passport-local");
const db = require("./database/index.js");
const ensureAuthentication = require("./middleware/ensureAuthentication.js");
const passportConfig = require("./helpers/passportConfig.js");

// App variables
const PORT = process.env.PORT || 8000
const app = express();

// Session configuration
const session = {
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

if (app.get("env") === "production") {
  // Cookies must be served over HTTPS in production
  session.cookie.secure = true;
}

// App configuration
app.use(express.json());
app.use(expressSession(session));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" }, passportConfig.verifyUser));
passport.serializeUser(passportConfig.serializeUser);
passport.deserializeUser(passportConfig.deserializeUser);

// Routes
app.get("/", (req, res, next) => {
  res.send("Test path");
});

app.get("/login-success", (req, res, next) => {
  res.send("Login was successfull")
});

app.post("/login",
passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/' }),
(req, res, next) => {
  res.status(200).send("Hello world");
});

app.post("/logout", ensureAuthentication, (req, res, next) => {
  if (req.user) {
  req.logout(err => console.log(err));
  }
  res.redirect('/');
});

app.get("/secret", ensureAuthentication, (req, res, next) => {
  const user = req.user?.first_name || 'Rachel';
  res.status(200).send('Hello there ' + user + '!' );
});

// app.get("/customer/:id", async (req, res, next) => {
//   const result = await db.query("SELECT * FROM customer WHERE id = $1", [req.params.id]);
//   res.json(result.rows);
// });

// Auth router
// const authRouter = require("./routes/auth.js");
// app.use("/auth", authRouter);

// App start
app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});

/*
{
    "email": "john.doe@example.com",
    "password": "dJSusyNSI7568sUF&Swsuis"
}
*/