const express = require("express");
const queries = require("./productQueries.js");
const generateError = require("../../helpers/generateError.js");
const sanitizeString = require("../../helpers/sanitizeString.js");
const validateId = require("../../helpers/validateId.js");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    let products = false;
    if (req.query.search) {
      const searchTerm = sanitizeString(req.query.search).toLowerCase();
      products = await queries.getProductsBySearchTerm(searchTerm);
      } else {
      products = await queries.getProducts();
    }
    if (products) {
      res.status(200).json(products);
    } else {
      next(generateError(404, "No products found."));
    }
  } catch(err) {
    next(generateError(500, err.message));
  }
});

router.get("/:productName", async (req, res, next) => {
  try {
    const productName = sanitizeString(req.params.productName).toLowerCase();
    const product = await queries.getProductByName(productName);
    if (product) {
      res.status(200).json(product);
    } else {
      next(generateError(404, "No product found with this name."));
    }
  } catch(err) {
    next(generateError(500, err.message));
  }
});

router.get("/id/:productId", async (req, res, next) => {
  const productId = validateId(req.params.productId);
  if (!productId) {
    return next(generateError(400, "Invalid value for productId path parameter."));
  }
  try {
    const product = await queries.getProductById(productId);
    if (product) {
      res.status(200).json(product);
    } else {
      next(generateError(404, "No product found with this ID."));
    }
  } catch(err) {
    next(generateError(500, err.message));
  }
});

module.exports = router;