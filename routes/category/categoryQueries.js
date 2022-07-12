const db = require("../../database/index.js");
const { formatCategories } = require("../../helpers/formatData.js");

const getCategories = async () => {
  const { rows: categories } = await db.query("SELECT * FROM category;");
  if (categories.length === 0) return false;
  const formattedCategories = formatCategories(categories);
  return formattedCategories;
};

module.exports = { getCategories };