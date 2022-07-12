const express = require("express");
const categoryQueries = require("./categoryQueries.js");
const productQueries = require("../product/productQueries.js");
const generateError = require("../../helpers/generateError.js");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const categories = await categoryQueries.getCategories();
    if (categories) {
      res.status(200).json(categories);
    } else {
      next(generateError(404, "No categories were found."));
    }
  } catch(err) {
    next(generateError(500, err.message));
  }
});

router.get("/:categoryName", async (req, res, next) => {
  try {
    // Research path param validation
    const categoryName = req.params.categoryName;
    const products = await productQueries.getProductsByCategoryName(categoryName);
    if (products) {
      res.status(200).json(products);
    } else {
      next(generateError(404, "No products found in this category."));
    }
  } catch(err) {
    next(generateError(500, err.message));
  }
});

module.exports = router;