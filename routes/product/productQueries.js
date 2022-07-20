"use strict";

const db = require("../../config/database.js");
const { formatProducts } = require("../../helpers/formatData.js");

const getProducts = async () => {
  const { rows: productQuery } = await db.query("SELECT * FROM product;");
  if (productQuery.length === 0) return false;
  const formattedProducts = formatProducts(productQuery);
  return formattedProducts;
};

const getProductsByCategoryName = async (categoryName) => {
  // Find the ID of the requested category
  const { rows: categoryQuery } = await db.query("SELECT id FROM category WHERE name = $1;", [categoryName]);
  if (categoryQuery.length === 0) return false;
  const categoryId = categoryQuery[0].id;

  // Find products that match the category ID 
  const { rows: productQuery } = await db.query("SELECT * FROM product WHERE category_id = $1;", [categoryId]);
  if (productQuery.length === 0) return false;
  const formattedProducts = formatProducts(productQuery);
  return formattedProducts;
};

const getProductsBySearchTerm = async (searchTerm) => {
  const { rows: productQuery } = await db.query("SELECT * FROM product WHERE name LIKE $1;", [`%${searchTerm}%`]);
  if (productQuery.length === 0) return false;
  const formattedProducts = formatProducts(productQuery);
  return formattedProducts;
};

const getProductByName = async (productName) => {
  const { rows: productQuery } = await db.query("SELECT * FROM product WHERE name = $1;", [productName]);
  if (productQuery.length === 0) return false;
  const formattedProducts = formatProducts(productQuery);
  return formattedProducts[0];
};

const getProductById = async (productId) => {
  const { rows: productQuery } = await db.query("SELECT * FROM product WHERE id = $1;", [productId]);
  if (productQuery.length === 0) return false;
  const formattedProducts = formatProducts(productQuery);
  return formattedProducts[0];
};

module.exports = {
  getProducts,
  getProductsByCategoryName,
  getProductsBySearchTerm,
  getProductByName,
  getProductById
};