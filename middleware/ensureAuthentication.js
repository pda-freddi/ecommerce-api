"use strict";

const generateError = require("../helpers/generateError.js");

const ensureAuthentication = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    next(generateError(401, "Authentication required to access this endpoint."));
  }
};

module.exports = ensureAuthentication;