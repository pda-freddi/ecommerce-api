const db = require("../../database/index.js");

const getCategories = async () => {
  const { rows } = await db.query("SELECT * FROM category");
  if (rows.length === 0) return false;
  const categories = rows.map(row => {
    return {
      id: row.id,
      name: row.name,
      displayName: row.display_name,
      description: row.description
    };
  });
  return categories;
};

module.exports = { getCategories };