const db = require("../../database/index.js");
const { getProductById } = require("../product/productQueries.js");

const getCart = async (shoppingSessionId) => {
  const { rows } = await db.query(
    `SELECT 
      cart_item.id AS id,
      cart_item.product_id AS product_id,
      cart_item.quantity AS quantity,
      shopping_session.total AS total
    FROM cart_item
    INNER JOIN shopping_session
      ON shopping_session.id = cart_item.shopping_session_id
    WHERE shopping_session.id = $1;`,
    [shoppingSessionId]
  );
  if (rows.length === 0) {
    return { total: 0, items: [] };
  }
  // Return total with first two decimal digits without rounding
  const cartTotal = Math.trunc(parseFloat(rows[0].total) * 100) / 100;
  const cartItems = await Promise.all(rows.map(async (item) => {
    const productDetails = await getProductById(item.product_id);
    return {
      id: item.id,
      product: {...productDetails},
      quantity: item.quantity
    };
  }));
  return { total: cartTotal, items: cartItems };
};

const addItemToCart = async (item, shoppingSessionId) => {
  // Get product details
  const product = await getProductById(item.productId);
  if (!product) return false;
  // Calculate total price of item
  const itemPrice = item.quantity * product.price;
  // Transaction: generate a record in cart_item and add total to shopping_session
  const client = await db.getClient();
  try {
    await client.query("BEGIN;");
    await client.query(
      `INSERT INTO cart_item (shopping_session_id, product_id, quantity)
      VALUES ($1, $2, $3);`,
      [shoppingSessionId, item.productId, item.quantity]
    );
    await client.query(
      `UPDATE shopping_session 
      SET total = total + $1, modified_at = DEFAULT
      WHERE id = $2;`,
      [itemPrice, shoppingSessionId]
    );
    await client.query("COMMIT;");
    return true;
  } catch(err) {
    await client.query("ROLLBACK;");
    throw err;
  } finally {
    client.release();
  }
};

const isProductInCart = async (productId, shoppingSessionId) => {
  const { rows } = await db.query(
    "SELECT * FROM cart_item WHERE shopping_session_id = $1 AND product_id = $2;",
    [shoppingSessionId, productId]
  );
  return rows.length > 0 ? true : false;
};

const isValidCartItem = async (itemId) => {
  const { rows } = await db.query("SELECT id FROM cart_item WHERE id = $1;", [itemId]);
  return rows.length > 0 ? true : false;
};

const updateCartItemById = async (itemId, quantity) => {
  // Get cart_item
  const { rows: cartQuery } = await db.query("SELECT * FROM cart_item WHERE id = $1;", [itemId]);
  const cartItem = cartQuery[0];
  // Get product details
  const { rows: productQuery } = await db.query("SELECT * FROM product WHERE id = $1;", [cartItem.product_id]);
  const product = productQuery[0];
  // Compare old quantity and new quantity
  const previousQuantity = cartItem.quantity;
  const newQuantity = quantity;
  const addToCartTotal = (newQuantity - previousQuantity) * product.price;
  // Transaction: update quantity in cart_item and total in shopping_sesion
  const client = await db.getClient();
  try {
    await client.query("BEGIN;");
    await client.query("UPDATE cart_item SET quantity = $1 WHERE id = $2;", [newQuantity, itemId]);
    await client.query(
      `UPDATE shopping_session 
      SET total = total + $1, modified_at = DEFAULT
      WHERE id = $2;`,
      [addToCartTotal, cartItem.shopping_session_id]
    );
    await client.query("COMMIT;");
    return true;
  } catch(err) {
    await client.query("ROLLBACK;");
    throw err;
  } finally {
    client.release();
  }
};

const deleteCartItemById = async (itemId) => {
  // Get cart_item
  const { rows: cartQuery } = await db.query("SELECT * FROM cart_item WHERE id = $1;", [itemId]);
  const cartItem = cartQuery[0];
  // Get product details
  const { rows: productQuery } = await db.query("SELECT * FROM product WHERE id = $1;", [cartItem.product_id]);
  const product = productQuery[0];
  // Calculate how much to subtract from cart total
  const itemQuantity = cartItem.quantity;
  const subtractFromCartTotal = itemQuantity * product.price;
  // Transaction: delete cart_item and subtract price from total in shopping_sesion
  const client = await db.getClient();
  try {
    await client.query("BEGIN;");
    await client.query("DELETE FROM cart_item WHERE id = $1;", [itemId]);
    await client.query(
      `UPDATE shopping_session 
      SET total = total - $1, modified_at = DEFAULT
      WHERE id = $2;`,
      [subtractFromCartTotal, cartItem.shopping_session_id]
    );
    await client.query("COMMIT;");
    return true;
  } catch(err) {
    await client.query("ROLLBACK;");
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getCart,
  addItemToCart,
  isProductInCart,
  isValidCartItem,
  updateCartItemById,
  deleteCartItemById
};