"use strict";

const db = require("../../config/database.js");
const { formatCategories } = require("../../helpers/formatData.js");

const getCategories = async () => {
  const { rows: categoryQuery } = await db.query("SELECT * FROM category;");
  if (categoryQuery.length === 0) return false;
  const formattedCategories = formatCategories(categoryQuery);
  return formattedCategories;
};

module.exports = { getCategories };