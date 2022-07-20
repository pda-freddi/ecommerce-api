"use strict";

const generateError = require("../helpers/generateError.js");
const validator = require("validator");

const validateLoginCredentials = (req, res, next) => {

  const required = ["email", "password"];

  // Check for missing required fields
  const receivedFields = Object.keys(req.body);
  const missingRequired = [];
  required.forEach(field => receivedFields.includes(field) ? null : missingRequired.push(field));
  if (missingRequired.length > 0) {
    return next(generateError(400, `Missing required field(s): ${missingRequired.join(", ")}`));
  }

  // Clear any extra keys that are not expected
  receivedFields.forEach(field => required.includes(field) ? null : delete req.body[field]);

  // Validate type of values
  const receivedEntries = Object.entries(req.body);
  const invalidType = [];
  receivedEntries.forEach(entry => {
    typeof entry[1] === "string" && entry[1].length > 0 ? null : invalidType.push(entry[0]);
  });
  if (invalidType.length > 0) {
    return next(generateError(
      400,
      `Invalid type for field(s): ${invalidType.join(", ")}. Must be a non-empty string.`
    ));
  }

  // Validate email
  const validEmail = validator.isEmail(req.body.email);
  if (!validEmail) {
    return next(generateError(400, "Invalid e-mail."));
  }

  next();
};

const validateCustomerData = (req, res, next) => {
  
  const required = ["email", "password", "confirmPassword", "firstName", "birthDate"];
  const optional = ["lastName", "phone"];

  // Check for missing required fields
  const receivedFields = Object.keys(req.body);
  const missingRequired = [];
  required.forEach(field => receivedFields.includes(field) ? null : missingRequired.push(field));
  if (missingRequired.length > 0) {
    return next(generateError(400, `Missing required field(s): ${missingRequired.join(", ")}`));
  }

  // Clear any extra keys that are not expected
  receivedFields.forEach(field => {
    required.includes(field) || optional.includes(field) ?
    null : delete req.body[field];
    });

  // Validate type of values
  const receivedEntries = Object.entries(req.body);
  const invalidType = [];
  receivedEntries.forEach(entry => {
    typeof entry[1] === "string" && entry[1].length > 0 ? null : invalidType.push(entry[0]);
  });
  if (invalidType.length > 0) {
    return next(generateError(
      400,
      `Invalid type for field(s): ${invalidType.join(", ")}. Must be a non-empty string.`
    ));
  }

  // Validate email
  const validEmail = validator.isEmail(req.body.email);
  if (!validEmail) {
    return next(generateError(400, "Invalid e-mail."));
  }

  // Validate password
  const strongPassword = validator.isStrongPassword(req.body.password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  });
  if (!strongPassword) {
    return next(generateError(400, `Password is too weak. Must be at least 8 characters long and contain one or more lowercase characters, uppercase characters, numbers and symbols.`));
  }

  // Validate password and confirmPassword fields
  if (req.body.password !== req.body.confirmPassword) {
    return next(generateError(400, "Password and confirm password fields don't match."));
  }

  // Validate birth date format
  const validDateFormat = validator.isDate(req.body.birthDate, { 
    format: "YYYY-MM-DD", 
    strictMode: true, 
    delimiters: ['-'] 
  });
  if (!validDateFormat) {
    return next(generateError(400, "Invalid birth date. Must be in the format YYYY-MM-DD."));
  }
  // Validate birth date range
  const birthDate = new Date(req.body.birthDate);
  const isMoreThanEighteenYearsOld = new Date(
    birthDate.getFullYear() + 18, birthDate.getMonth(), birthDate.getDate() + 1) <= new Date();
  if (!isMoreThanEighteenYearsOld) {
    return next(generateError(400, "You must be at least 18 years old to register."));
  } else if (birthDate < new Date("01-01-1904")) {
    return next(generateError(400, "Birth date must be after 01-01-1904."));
  }

  // Validate phone
  if (req.body.phone) {
    const validPhone = validator.isMobilePhone(req.body.phone, "any", { strictMode: true });
    if (!validPhone) {
      return next(generateError(400, "Please provide a valid phone number in international format (e.g. +1-212-456-7890)"));
    }
  }

  // Trim first and last name
  req.body.firstName = validator.trim(req.body.firstName);
  if (req.body.lastName) {
    req.body.lastName = validator.trim(req.body.lastName);
  }

  // Make missing optional fields explicit in request body
  optional.forEach(field => receivedFields.includes(field) ? null : req.body[field] = null);

  next();
};

const validateShippingAddress = (req, res, next) => {
  
  const required = ["addressLine1", "city", "postalCode", "country"];
  const optional = ["addressLine2"];

  // Check for missing required fields
  const receivedFields = Object.keys(req.body);
  const missingRequired = [];
  required.forEach(field => receivedFields.includes(field) ? null : missingRequired.push(field));
  if (missingRequired.length > 0) {
    return next(generateError(400, `Missing required field(s): ${missingRequired.join(", ")}`));
  }

  // Clear any extra keys that are not expected
  receivedFields.forEach(field => {
    required.includes(field) || optional.includes(field) ?
    null : delete req.body[field];
    });

  // Validate type of values
  const receivedEntries = Object.entries(req.body);
  const invalidType = [];
  receivedEntries.forEach(entry => {
    typeof entry[1] === "string" && entry[1].length > 0 ? null : invalidType.push(entry[0]);
  });
  if (invalidType.length > 0) {
    return next(generateError(
      400,
      `Invalid type for field(s): ${invalidType.join(", ")}. Must be a non-empty string.`
    ));
  }

  // Validate postal code
  const validPostalCode = validator.isPostalCode(req.body.postalCode, "any");
  if (!validPostalCode) {
    return next(generateError(400, "Invalid postal code."));
  }

  // Trim strings
  req.body.addressLine1 = validator.trim(req.body.addressLine1);
  if (req.body.addressLine2) {
    req.body.addressLine2 = validator.trim(req.body.addressLine2);
  }
  req.body.city = validator.trim(req.body.city);
  req.body.country = validator.trim(req.body.country);

  // Make missing optional fields explicit in request body
  optional.forEach(field => receivedFields.includes(field) ? null : req.body[field] = null);

  next();
};

module.exports = {
  validateLoginCredentials,
  validateCustomerData,
  validateShippingAddress
}