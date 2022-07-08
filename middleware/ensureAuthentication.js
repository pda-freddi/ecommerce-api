// This middleware ensures the customer is authenticated
const ensureAuthentication = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    // TO DO: ADD HEADER INDICATING THE ROUTE FOR LOGIN
    res.status(401).json({ message: "You must be logged in to access this endpoint" });
  }
};

module.exports = ensureAuthentication;