"use strict";

const validator = require("validator");

const sanitizeString = (string) => {
  let sanitized;
  // Remove characters with a numerical value < 32 and 127 (control characters)
  sanitized = validator.stripLow(string);
  // Remove blacklisted characters
  sanitized = validator.blacklist(sanitized, ["\"", "\'", "\`", ";", "=", "\*", "$"]);
  return sanitized;
};

module.exports = sanitizeString;