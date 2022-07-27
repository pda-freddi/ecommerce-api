"use strict";

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const openApiDocument = require("../../docs/api-specification/openapi.json");

const router = express.Router();

router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(openApiDocument));

module.exports = router;