const db = require("../../database/index.js");
const { formatProducts } = require("../../helpers/formatData.js");

const getProducts = async () => {
  const { rows: products } = await db.query("SELECT * FROM product;");
  if (products.length === 0) return false;
  const formattedProducts = formatProducts(products);
  return formattedProducts;
};

const getProductsByCategoryName = async (categoryName) => {
  const { rows: category } = await db.query("SELECT id FROM category WHERE name = $1;", [categoryName]);
  if (category.length === 0) return false;
  const categoryId = category[0].id;
  const { rows: products } = await db.query("SELECT * FROM product WHERE category_id = $1;", [categoryId]);
  if (products.length === 0) return false;
  const formattedProducts = formatProducts(products);
  return formattedProducts;
};

const getProductsBySearchTerm = async (searchTerm) => {
  const { rows: products } = await db.query("SELECT * FROM product WHERE name LIKE $1;", [`%${searchTerm}%`]);
  if (products.length === 0) return false;
  const formattedProducts = formatProducts(products);
  return formattedProducts;
};

const getProductByName = async (productName) => {
  const { rows: products } = await db.query("SELECT * FROM product WHERE name = $1;", [productName]);
  if (products.length === 0) return false;
  const formattedProducts = formatProducts(products);
  return formattedProducts[0];
};

const getProductById = async (productId) => {
  const { rows: products } = await db.query("SELECT * FROM product WHERE id = $1;", [productId]);
  if (products.length === 0) return false;
  const formattedProducts = formatProducts(products);
  return formattedProducts[0];
};

module.exports = {
  getProducts,
  getProductsByCategoryName,
  getProductsBySearchTerm,
  getProductByName,
  getProductById
};