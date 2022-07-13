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
  if (!Number.isInteger(productId) || productId <= 0 || productId > 100000000) {
    return next(generateError(400, "ProductId field is missing or has an invalid value."));
  } else if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 1000) {
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

router.put("/:itemId", ensureAuthentication, async (req, res, next) => {
  /*
  TO DO: MUST VALIDATE IF CART ITEM BELONGS TO THE REQUESTING SHOPPING SESSION;
  */
  // Validate itemId parameter
  const itemId = Number(req.params.itemId);
  if (!Number.isInteger(itemId) || itemId <= 0 || itemId > 100000000) {
    return next(generateError(400, "Invalid value for itemId path parameter."));
  }
  // Validate quantity field in the request body
  const { quantity } = req.body;
  if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 1000) {
    return next(generateError(400, "Quantity field is missing or has an invalid value."));
  }
  try {
  // Locate item in the cart by the itemId
  const isValidItem = await queries.isValidCartItem(itemId);
  if (!isValidItem) {
    return next(generateError(404, "Can't find a cart item with the ID value provided."));
  }
  // Update the cart
  const updateCartItem = await queries.updateCartItemById(itemId, quantity);
  // Returns true if operation was successful
  if (updateCartItem) {
    res.status(204).send();
  } else {
    next(generateError(500, "Something went wrong. The item was not updated."));
  }
  } catch(err) {
    next(generateError(500, err.message));
  }
});

router.delete("/:itemId", ensureAuthentication, async (req, res, next) => {
  // Validate itemId parameter
  const itemId = Number(req.params.itemId);
  if (!Number.isInteger(itemId) || itemId <= 0 || itemId > 100000000) {
    return next(generateError(400, "Invalid value for itemId path parameter."));
  }
  try {
    // Locate item in the cart by the itemId
    const isValidItem = await queries.isValidCartItem(itemId);
    if (!isValidItem) {
      return next(generateError(404, "Can't find a cart item with the ID value provided."));
    }
    // Delete the item from cart
    const deleteCartItem = await queries.deleteCartItemById(itemId);
    // Returns true if operation was successful
    if (deleteCartItem) {
      res.status(204).send();
    } else {
      next(generateError(500, "Something went wrong. The item was not deleted."));
    }
    } catch(err) {
      next(generateError(500, err.message));
    }
});

module.exports = router;