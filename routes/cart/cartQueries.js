const db = require("../../config/database.js");
const { getProductById } = require("../product/productQueries.js");

const getCart = async (shoppingSessionId) => {
  // Get cart items that match the shopping session ID
  const { rows: cartItemQuery } = await db.query(
    "SELECT * FROM cart_item WHERE shopping_session_id = $1;",
    [shoppingSessionId]
  );
  if (cartItemQuery.length === 0) {
    return { total: 0, items: [] };
  }

  // Get shopping session total
  const { rows: shoppingSessionQuery } = await db.query (
    "SELECT total FROM shopping_session WHERE id = $1;",
    [shoppingSessionId]
  );

  // Return total with first two decimal digits and no rounding
  const cartTotal = Math.trunc(parseFloat(shoppingSessionQuery[0].total) * 100) / 100;

  // Get detailed product information for each cart item
  const cartItems = await Promise.all(cartItemQuery.map(async (item) => {
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

// Check if provided product ID and shopping session ID match in a cart item
const isProductInCart = async (productId, shoppingSessionId) => {
  const { rows: cartItemQuery } = await db.query(
    "SELECT * FROM cart_item WHERE shopping_session_id = $1 AND product_id = $2;",
    [shoppingSessionId, productId]
  );
  return cartItemQuery.length > 0 ? true : false;
};

// Verify if a cart item with the specified ID exists
const isValidCartItem = async (itemId) => {
  const { rows: cartItemQuery } = await db.query("SELECT id FROM cart_item WHERE id = $1;", [itemId]);
  return cartItemQuery.length > 0 ? true : false;
};

// Check whether the item ID is associated with the provided shopping session ID
const isCartItemOwner = async (itemId, shoppingSessionId) => {
  const { rows: cartItemQuery } = await db.query(
    "SELECT id FROM cart_item WHERE id = $1 AND shopping_session_id = $2;",
    [itemId, shoppingSessionId]
  );
  return cartItemQuery.length > 0 ? true : false;
};

const updateCartItemById = async (itemId, quantity) => {
  // Get cart item
  const { rows: cartItemQuery } = await db.query("SELECT * FROM cart_item WHERE id = $1;", [itemId]);
  const cartItem = cartItemQuery[0];

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
  // Get cart item
  const { rows: cartItemQuery } = await db.query("SELECT * FROM cart_item WHERE id = $1;", [itemId]);
  const cartItem = cartItemQuery[0];

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
  isCartItemOwner,
  updateCartItemById,
  deleteCartItemById
};