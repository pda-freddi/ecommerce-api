const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const ensureAuthentication = require("../../middleware/ensureAuthentication.js");
const generateError = require("../../helpers/generateError.js");
const queries = require("./customerQueries.js");

const router = express.Router();

router.post("/login", passport.authenticate('local'), (req, res, next) => {
    res.status(200).send();
  });

router.post("/logout", ensureAuthentication, (req, res, next) => {
  req.logout(err => next(err));
  res.status(204).send();
});

router.get("/", ensureAuthentication, (req, res, next) => {
  const customer = req.user;
  delete customer.id;
  delete customer.shoppingSessionId;
  res.status(200).json(customer);
});

router.post("/", async (req, res, next) => {
  const newCustomer = req.body;
  try {
    // Check if required fields are present
    if (!newCustomer.email || !newCustomer.password || !newCustomer.confirmPassword
    || !newCustomer.firstName || !newCustomer.birthDate) {
      return next(generateError(400, "Missing required field(s)."));
    }
    newCustomer.lastName = newCustomer.lastName || null;
    newCustomer.phone = newCustomer.phone || null;
    // Verify if the email is already registered
    const isCustomer = await queries.isCustomer(newCustomer.email);
    if (isCustomer) {
      return next(generateError(400, "The email provided is already registered to a customer."));
    }
    // Verify if password and confirmPassword match
    if (newCustomer.password !== newCustomer.confirmPassword) {
      return next(generateError(400, "The password and confirm password fields don't match."));
    }
    // Verify if email, name, birth date and phone provided are valid
    
    // Hash password before storing
    const passwordHash = await bcrypt.hash(newCustomer.password, 10);
    newCustomer.password = passwordHash;
    delete newCustomer.confirmPassword;

    const createdCustomer = await queries.createCustomer(newCustomer);
    if (createdCustomer) {
      res.status(201).send();
    } else {
      next(generateError(500, "Failed to create customer."));
    }
  } catch(err) {
    next(generateError(500, err.message));
  }
});

router.put("/", async (req, res, next) => {
  const customerId = req.user.id;
  const customerInfo = req.body;
  try {
    // Check if required fields are present
    if (!customerInfo.email || !customerInfo.password || !customerInfo.confirmPassword
    || !customerInfo.firstName || !customerInfo.birthDate) {
      return next(generateError(400, "Missing required field(s)."));
    }
    customerInfo.lastName = customerInfo.lastName || null;
    customerInfo.phone = customerInfo.phone || null;
    // Verify if the email is already registered
    const isCustomer = await queries.isCustomer(customerInfo.email);
    if (isCustomer) {
      return next(generateError(400, "The email provided is already registered to a customer."));
    }
    // Verify if password and confirmPassword match
    if (customerInfo.password !== customerInfo.confirmPassword) {
      return next(generateError(400, "The password and confirm password fields don't match."));
    }
    // Verify if email, name, birth date and phone provided are valid
    
    // Hash password before storing
    const passwordHash = await bcrypt.hash(customerInfo.password, 10);
    customerInfo.password = passwordHash;
    delete customerInfo.confirmPassword;

    const updatedCustomer = await queries.updateCustomerById(customerInfo, customerId);
    if (updatedCustomer) {
      res.status(200).send();
    } else {
      next(generateError(500, "Failed to update customer."));
    }
  } catch(err) {
    next(generateError(500, err.message));
  }
});

router.delete("/", ensureAuthentication, async (req, res, next) => {
  const customerId = req.user.id;
  try {
    const deletedCustomer = await queries.deleteCustomerById(customerId);
    if (deletedCustomer) {
      req.logout(err => next(err));
      res.status(204).send();
    } else {
      next(generateError(500, "Failed to delete customer."));
    }
  } catch(err) {
    next(generateError(500, err.message));
  }
});

// To do: implement /customer/orders route

module.exports = router;

/*
{
  "email": "peter.parker@example.com",
  "password": "spiderman123",
  "confirmPassword": "spiderman123",
  "firstName": "Peter",
  "lastName": "Parker",
  "birthDate": "09-05-1995",
  "phone": "487-816-8501"
}
{
  "email": "peter.parker@example.com",
  "password": "spiderman123"
}
*/