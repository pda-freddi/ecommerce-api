const express = require("express");
const asyncHandler = require("express-async-handler");
const ensureAuthentication = require("../../middleware/ensureAuthentication.js");
const queries = require("./cartQueries.js");
const generateError = require("../../helpers/generateError.js");
const validateId = require("../../helpers/validateId.js");
const { getProductById } = require("../product/productQueries.js");

const router = express.Router();

router.get("/", ensureAuthentication, asyncHandler(async (req, res, next) => {
  // Get customer's cart by shopping session ID
  const cart = await queries.getCart(req.user.shoppingSessionId);
  if (cart) {
    res.status(200).json(cart);
  } else {
    next(generateError(500, "Something went wrong. Could not retrieve cart."));
  }
}));

router.post("/", ensureAuthentication, asyncHandler(async (req, res, next) => {
  const shoppingSessionId = req.user.shoppingSessionId;

  // Validate data from request body
  const productId = validateId(req.body.productId);
  // Quantity must obey same constraints set for ID values
  const quantity = validateId(req.body.quantity);
  if (!productId) {
    return next(generateError(400, "ProductId field is missing or has an invalid value."));
  } else if (!quantity || quantity > 500) {
    return next(generateError(400, "Quantity field is missing or has an invalid value."));
  }

  // Check if product is already in the cart
  const productInCart = await queries.isProductInCart(productId, shoppingSessionId);
  if (productInCart) {
    return next(generateError(400, "This product is already in the cart."));
  }

  // Check if product exists
  const isValidProduct = await getProductById(productId);
  if (!isValidProduct) {
    return next(generateError(400, "Can't find a product with this productId."));
  }

  // Add the item to cart
  const addToCart = await queries.addItemToCart({ productId, quantity }, shoppingSessionId);
  if (addToCart) {
    res.status(201).send();
  } else {
    next(generateError(500, "Something went wrong. The item was not added to the cart."));
  }
}));

router.put("/:itemId", ensureAuthentication, asyncHandler(async (req, res, next) => {
  // Validate itemId path parameter
  const itemId = validateId(req.params.itemId);
  if (!itemId) {
    return next(generateError(400, "Invalid value for itemId path parameter."));
  }

  // Quantity must obey same constraints set for ID values
  const quantity = validateId(req.body.quantity);
  if (!quantity || quantity > 500) {
    return next(generateError(400, "Quantity field is missing or has an invalid value."));
  }

  // Check if the requested item exists
  const isValidItem = await queries.isValidCartItem(itemId);
  if (!isValidItem) {
    return next(generateError(404, "Can't find a cart item with the ID value provided."));
  }

  // Check if cart item belongs to the requesting shopping session
  const shoppingSessionId = req.user.shoppingSessionId;
  const isCartItemOwner = await queries.isCartItemOwner(itemId, shoppingSessionId);
  if (!isCartItemOwner) {
    return next(generateError(403, "Not authorized to update this cart item."));
  }
  
  // Update the cart
  const updateCartItem = await queries.updateCartItemById(itemId, quantity);
  if (updateCartItem) {
    res.status(204).send();
  } else {
    next(generateError(500, "Something went wrong. The item was not updated."));
  }
}));

router.delete("/:itemId", ensureAuthentication, asyncHandler(async (req, res, next) => {
  // Validate itemId parameter
  const itemId = validateId(req.params.itemId);
  if (!itemId) {
    return next(generateError(400, "Invalid value for itemId path parameter."));
  }

  // Check if the requested item exists
  const isValidItem = await queries.isValidCartItem(itemId);
  if (!isValidItem) {
    return next(generateError(404, "Can't find a cart item with the ID value provided."));
  }

  // Check if cart item belongs to the requesting shopping session
  const shoppingSessionId = req.user.shoppingSessionId;
  const isCartItemOwner = await queries.isCartItemOwner(itemId, shoppingSessionId);
  if (!isCartItemOwner) {
    return next(generateError(403, "Not authorized to delete this cart item."));
  }

  // Delete the item from cart
  const deleteCartItem = await queries.deleteCartItemById(itemId);
  if (deleteCartItem) {
    res.status(204).send();
  } else {
    next(generateError(500, "Something went wrong. The item was not deleted."));
  }
}));

module.exports = router;