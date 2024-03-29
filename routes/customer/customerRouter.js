"use strict";

const express = require("express");
const asyncHandler = require("express-async-handler");
const passport = require("passport");
const bcrypt = require("bcrypt");
const ensureAuthentication = require("../../middleware/ensureAuthentication.js");
const generateError = require("../../helpers/generateError.js");
const queries = require("./customerQueries.js");
const { validateLoginCredentials, 
        validateCustomerData } = require("../../middleware/validateReqBody.js");

const router = express.Router();

router.post("/login",
  validateLoginCredentials,
  passport.authenticate('local'),
  (req, res, next) => res.status(204).send()
);

router.post("/logout", ensureAuthentication, (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(generateError(500, "Something went wrong during the logout process."));
    } else {
      return res.status(204).send();
    }
  });
});

router.get("/", ensureAuthentication, (req, res, next) => {
  // Customer object persisted through sessions
  const customer = req.user;
  // Delete sensible information before sending to the client
  delete customer.id;
  delete customer.shoppingSessionId;
  res.status(200).json(customer);
});

router.post("/", validateCustomerData, asyncHandler(async (req, res, next) => {
  // Data from request body was validaded in previous middleware
  const customer = req.body;

  // Verify if the email is already registered
  const isCustomer = await queries.isCustomer(customer.email);
  if (isCustomer) {
    return next(generateError(400, "This email is already registered to a customer."));
  }

  // Hash password before storing
  const passwordHash = await bcrypt.hash(customer.password, 10);
  customer.password = passwordHash;
  delete customer.confirmPassword;

  // Create customer
  const createCustomer = await queries.createCustomer(customer);
  if (createCustomer) {
    res.status(201).send();
  } else {
    next(generateError(500, "Failed to create customer."));
  }
}));

router.put("/", ensureAuthentication, validateCustomerData, asyncHandler(async (req, res, next) => {
  const customerId = req.user.id;
  // Data from request body was validaded in previous middleware
  const customer = req.body;

  // Verify if the email is already registered to a different customer
  if (req.user.email !== customer.email) {
    const isCustomer = await queries.isCustomer(customer.email);
    if (isCustomer) {
      return next(generateError(400, "This email is already registered to a customer."));
    }
  }

  // Hash password before storing
  const passwordHash = await bcrypt.hash(customer.password, 10);
  customer.password = passwordHash;
  delete customer.confirmPassword;

  // Update customer
  const updateCustomer = await queries.updateCustomerById(customer, customerId);
  if (updateCustomer) {
    res.status(200).send();
  } else {
    next(generateError(500, "Failed to update customer."));
  }
}));

router.delete("/", ensureAuthentication, asyncHandler(async (req, res, next) => {
  const customerId = req.user.id;
  const deleteCustomer = await queries.deleteCustomerById(customerId);
  // Log out the customer if delete was successful
  if (deleteCustomer) {
    req.logout(err => {
      if (err) {
        return next(generateError(500, "Something went wrong during the logout process."));
      } else {
        return res.status(204).send();
      }
    });
  } else {
    next(generateError(500, "Failed to delete customer."));
  }
}));

module.exports = router;