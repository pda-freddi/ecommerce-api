const express = require("express");
const queries = require("./productQueries.js");
const generateError = require("../../helpers/generateError.js");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    let products = false;
    if (req.query.search) {
      // Research query param validation
      const searchTerm = req.query.search.toLowerCase();
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
    // Research path parameter validation
    const productName = req.params.productName;
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
  try {
    // Research path parameter validation
    const productId = parseInt(req.params.productId);
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