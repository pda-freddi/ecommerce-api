"use strict";

const greeting = (req, res) => {
  res.send(`Welcome! Check the API documentation at: ${process.env.API_DOCS_URL}`);
};

module.exports = greeting;