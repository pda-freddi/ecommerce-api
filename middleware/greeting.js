"use strict";

const greeting = (req, res) => {
  res.send("Welcome! Check the API documentation at: https://ecommerce-api-pdafr.herokuapp.com/api/docs");
};

module.exports = greeting;