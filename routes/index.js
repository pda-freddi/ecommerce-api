"use strict";

const express = require("express");
const customerRouter = require("./customer/customerRouter.js");
const categoryRouter = require("./category/categoryRouter.js");
const productRouter = require("./product/productRouter.js");
const cartRouter = require("./cart/cartRouter.js");
const orderRouter = require("./order/orderRouter.js");
const docsRouter = require("./docs/docsRouter.js");

const router = express.Router();

router.use("/customer", customerRouter);
router.use("/category", categoryRouter);
router.use("/product", productRouter);
router.use("/cart", cartRouter);
router.use("/order", orderRouter);
router.use("/docs", docsRouter);

module.exports = router;