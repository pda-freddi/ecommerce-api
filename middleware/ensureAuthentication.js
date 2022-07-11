const ensureAuthentication = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send();
  }
};

module.exports = ensureAuthentication;