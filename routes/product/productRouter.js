const express = require("express");
const asyncHandler = require("express-async-handler");
const queries = require("./productQueries.js");
const generateError = require("../../helpers/generateError.js");
const sanitizeString = require("../../helpers/sanitizeString.js");
const validateId = require("../../helpers/validateId.js");

const router = express.Router();

router.get("/", asyncHandler(async (req, res, next) => {
  // Variable that will contain products array
  let products = false;

  // Get products that match a search term if one was provided
  if (req.query.search) {
    const searchTerm = sanitizeString(req.query.search).toLowerCase();
    products = await queries.getProductsBySearchTerm(searchTerm);
  } else {
    // Or get all products
    products = await queries.getProducts();
  }
  if (products) {
    res.status(200).json(products);
  } else {
    next(generateError(404, "No products found."));
  }
}));

router.get("/:productName", asyncHandler(async (req, res, next) => {
  // Sanitize productName path parameter
  const productName = sanitizeString(req.params.productName).toLowerCase();

  // Get product with that name
  const product = await queries.getProductByName(productName);
  if (product) {
    res.status(200).json(product);
  } else {
    next(generateError(404, "No product found with this name."));
  }
}));

router.get("/id/:productId", asyncHandler(async (req, res, next) => {
  // Validate productId path parameter
  const productId = validateId(req.params.productId);
  if (!productId) {
    return next(generateError(400, "Invalid value for productId path parameter."));
  }

  // Get product that matches the ID parameter
  const product = await queries.getProductById(productId);
  if (product) {
    res.status(200).json(product);
  } else {
    next(generateError(404, "No product found with this ID."));
  }
}));

module.exports = router;