// Required modules
require("dotenv").config();
const express = require("express");
const expressSession = require("express-session");
const pgSession = require("connect-pg-simple")(expressSession);
const db = require("./db/index.js");

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
  // Serve cookies only over HTTPS in production
  session.cookie.secure = true;
}

// App configuration
app.use(expressSession(session));

// Routes
app.get("/", (req, res, next) => {
  res.send("Test path");
});

app.get("/customer/:id", async (req, res, next) => {
  const result = await db.query("SELECT * FROM customer WHERE id = $1", [req.params.id]);
  res.json(result.rows);
});

// App start
app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});