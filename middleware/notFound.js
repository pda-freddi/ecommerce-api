const generateError = require("../helpers/generateError.js");

const notFound = (req, res, next) => {
  next(generateError(404, "Can't find the requested resource."));
};

module.exports = notFound;