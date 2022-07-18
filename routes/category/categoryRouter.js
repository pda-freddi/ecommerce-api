const express = require("express");
const asyncHandler = require("express-async-handler");
const queries = require("./categoryQueries.js");
const { getProductsByCategoryName } = require("../product/productQueries.js");
const generateError = require("../../helpers/generateError.js");
const sanitizeString = require("../../helpers/sanitizeString.js");

const router = express.Router();

router.get("/", asyncHandler(async (req, res, next) => {
    // Get all categories
    const categories = await queries.getCategories();
    if (categories) {
      res.status(200).json(categories);
    } else {
      next(generateError(404, "No categories were found."));
    }
}));

router.get("/:categoryName", asyncHandler(async (req, res, next) => {
  // Validate categoryName path parameter
  const categoryName = sanitizeString(req.params.categoryName).toLowerCase();
  
  // Get products that belong to the specified category
  const products = await getProductsByCategoryName(categoryName);
  if (products) {
    res.status(200).json(products);
  } else {
    next(generateError(404, "No products found in this category."));
  }
}));

module.exports = router;