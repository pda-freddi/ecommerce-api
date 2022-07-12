const express = require("express");
const ensureAuthentication = require("../../middleware/ensureAuthentication.js");
const queries = require("./cartQueries.js");
const generateError = require("../../helpers/generateError.js");

const router = express.Router();

router.get("/", ensureAuthentication, async (req, res, next) => {
  try {
    // Get customer's cart by supplying the shopping session ID
    const cart = await queries.getCart(req.user.shoppingSessionId);
    if (cart) {
      res.status(200).json(cart);
    } else {
      next(generateError(500, "Something went wrong. Could not retrieve cart."));
    }
  } catch(err) {
    next(generateError(500, err.message));
  }
});

router.post("/", ensureAuthentication, async (req, res, next) => {
  const shoppingSessionId = req.user.shoppingSessionId;
  const { productId, quantity } = req.body;
  if (!Number.isInteger(productId) || productId <= 0) {
    return next(generateError(400, "ProductId field is missing or has an invalid value."));
  } else if (!Number.isInteger(quantity) || quantity <= 0) {
    return next(generateError(400, "Quantity field is missing or has an invalid value."));
  }
  try {
    // Check if product is already in the cart
    const productInCart = await queries.isProductInCart(productId, shoppingSessionId);
    if (productInCart) {
      return next(generateError(400, "This product is already in the cart."));
    }
    // Returns true if item was added successfully
    const addToCart = await queries.addItemToCart({ productId, quantity }, shoppingSessionId);
    if (addToCart) {
      res.status(201).send();
    } else {
      next(generateError(500, "Something went wrong. The item was not added to the cart."));
    }
  } catch(err) {
    next(generateError(500, err.message));
  }
});

module.exports = router;