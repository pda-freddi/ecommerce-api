const express = require("express");
const asyncHandler = require("express-async-handler");
const ensureAuthentication = require("../../middleware/ensureAuthentication.js");
const queries = require("./orderQueries.js");
const generateError = require("../../helpers/generateError.js");
const { validateShippingAddress } = require("../../middleware/validateReqBody.js");
const { getCart } = require("../cart/cartQueries.js");
const validateId = require("../../helpers/validateId.js");

const router = express.Router();

router.get("/", ensureAuthentication, asyncHandler(async (req, res, next) => {
  const customerId = req.user.id;
  const orders = await queries.getOrdersByCustomerId(customerId);
  if (orders) {
    res.status(200).json(orders);
  } else {
    next(generateError(500, "Something went wrong. Could not retrieve orders."));
  }
}));

router.post("/", ensureAuthentication, validateShippingAddress, asyncHandler(async (req, res, next) => {
  const shoppingSessionId = req.user.shoppingSessionId;
  const customerId = req.user.id;
  // Shipping address was validated by previous middleware
  const address = req.body;

  // Check if cart has at least one item
  const cart = await getCart(shoppingSessionId);
  if (cart.items.length === 0) {
    return next(generateError(400, "Shopping cart is empty."));
  }

  // Create order
  const orderId = await queries.createOrder(address, customerId, shoppingSessionId);
  if (orderId) {
    res.status(201).json({ orderId: orderId });
  } else {
    next(generateError(500, "Something went wrong. The order was not created."));
  }
}));

router.get("/:orderId", ensureAuthentication, asyncHandler(async (req, res, next) => {
  // Validate orderId path parameter
  const orderId = validateId(req.params.orderId);
  if (!orderId) {
    return next(generateError(400, "Invalid value for orderId path parameter."));
  }

  // Check if requested order exists
  const isValidOrder = await queries.isValidOrder(orderId);
  if (!isValidOrder) {
    return next(generateError(404, "No order found with this ID."));
  }

  // Check if the order belongs to the requesting customer
  const customerId = req.user.id;
  const isOrderOwner = await queries.isOrderOwner(orderId, customerId);
  if (!isOrderOwner) {
    return next(generateError(403, "Not authorized to access this order."));
  }

  // Get the order
  const order = await queries.getOrderById(orderId);
  if (order) {
    res.status(200).json(order);
  } else {
    next(generateError(500, "Something went wrong. Could not retrieve the order."));
  }
}));

router.delete("/:orderId", ensureAuthentication, asyncHandler(async (req, res, next) => {
  // Validate orderId path parameter
  const orderId = validateId(req.params.orderId);
  if (!orderId) {
    return next(generateError(400, "Invalid value for orderId path parameter."));
  }

  // Check if requested order exists
  const isValidOrder = await queries.isValidOrder(orderId);
  if (!isValidOrder) {
    return next(generateError(404, "No order found with this ID."));
  }

  // Check if the requested order belongs to the requesting customer
  const customerId = req.user.id;
  const isOrderOwner = await queries.isOrderOwner(orderId, customerId);
  if (!isOrderOwner) {
    return next(generateError(403, "Not authorized to access this order."));
  }

  // Check if order status allows deletion
  const orderStatus = await queries.getOrderStatusById(orderId);
  if (orderStatus !== "pending") {
    return next(generateError(400, "Can't delete order: status is not pending."));
  }

  // Delete the order
  const deleteOrder = await queries.deleteOrderById(orderId);
  if (deleteOrder) {
    res.status(204).send();
  } else {
    next(generateError(500, "Something went wrong. Could not delete order."));
  }
}));

module.exports = router;