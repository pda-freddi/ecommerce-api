// Required modules
require("dotenv").config();
const express = require("express");
const expressSession = require("express-session");
const pgSession = require("connect-pg-simple")(expressSession);
const db = require("./database/index.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportConfig = require("./helpers/passportConfig.js");
const customerRouter = require("./routes/customer/customerRouter.js");
const categoryRouter = require("./routes/category/categoryRouter.js");
const productRouter = require("./routes/product/productRouter.js");
const cartRouter = require("./routes/cart/cartRouter.js");
const errorHandler = require("./middleware/errorHandler.js");

// App variables
const app = express();
const PORT = process.env.PORT || 8000;
const env = app.get("env");

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

if (env === "production") {
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
app.use("/customer", customerRouter);
app.use("/category", categoryRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);

// Error handling
app.use(errorHandler);

// App start
app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});