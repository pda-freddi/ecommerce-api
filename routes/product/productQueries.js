const db = require("../../database/index.js");

const getProductsByCategoryName = async (categoryName) => {
  const { rows } = await db.query(
    "SELECT id FROM category WHERE name = $1",
    [categoryName]
  );
  if (rows.length === 0) return false;
  const categoryId = rows[0].id;
  const { rows: products } = await db.query(
    "SELECT * FROM product WHERE category_id = $1",
    [categoryId]
  );
  if (products.length === 0) return false;
  const formattedProducts = products.map(product => {
    return {
      id: product.id,
      name: product.name,
      displayName: product.display_name,
      SKU: product.SKU,
      price: parseFloat(product.price),
      description: product.description,
      image: product.image,
      thumbnail: product.thumbnail,
      inStock: product.in_stock,
      categoryId: product.category_id
    };
  });
  return formattedProducts;
};

module.exports = {
  getProductsByCategoryName
};