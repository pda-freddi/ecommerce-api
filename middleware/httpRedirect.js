// This middlewire redirects HTTP requests to enforce the use of HTTPS
const httpRedirect = (req, res, next) => {
  if (req.secure || req.headers["x-forwaded-proto"] === "https") {
    return next();
  };
  res.redirect("https://" + req.hostname + req.url);
};

module.exports = httpRedirect;