"use strict";

const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong, please try again.";
  res.status(status).json({ message: message });
};

module.exports = errorHandler;