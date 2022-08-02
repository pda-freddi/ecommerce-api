const generateError = require("../helpers/generateError.js");

// This middlewire redirects HTTP requests to enforce the use of HTTPS
const httpRedirect = (req, res, next) => {
  if (req.secure || req.headers["x-forwaded-proto"] === "https") {
    return next();
  };
  if (req.method !== "GET") {
    return next(generateError(400, "Request must be made over HTTPS."));
  }
  res.redirect("https://" + req.hostname + req.url);
};

module.exports = httpRedirect;