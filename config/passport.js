"use strict";

const queries = require("../routes/customer/customerQueries.js");
const generateError = require("../helpers/generateError.js");
const bcrypt = require("bcrypt");

const verifyUser = async (email, password, done) => {
  try {
    const user = await queries.getCustomerByEmail(email);
    if (!user) {
      return done(generateError(401, "Invalid e-mail or password."));
    }
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return done(generateError(401, "Invalid e-mail or password."));
    } else {
      return done(null, user);
    }
  } catch(err) {
    return done(err);
  }
};

const serializeUser = (user, done) => {
  done(null, { id: user.id });
};

const deserializeUser = async (user, done) => {
  try {
    const customer = await queries.getCustomerById(user.id);
    done(null, customer);
  } catch(err) {
    done(err);
  }
};

module.exports = {
  verifyUser,
  serializeUser,
  deserializeUser
}