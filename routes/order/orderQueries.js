"use strict";

const db = require("../../config/database.js");
const { getProductById } = require("../product/productQueries.js");

const createOrder = async (address, customerId, shoppingSessionId) => {
  // Get information about the shopping session
  const { rows: shoppingSessionQuery } = await db.query(
    "SELECT * FROM shopping_session WHERE id = $1;",
    [shoppingSessionId]
  );
  const shoppingSession = shoppingSessionQuery[0];

  // Get information about the cart items of the current shopping session
  const { rows: cartItemQuery } = await db.query(
    "SELECT * FROM cart_item WHERE shopping_session_id = $1;",
    [shoppingSessionId]
  );
  const cartItems = cartItemQuery;

  // Transaction to create the order:
  const client = await db.getClient();

  try {
    await client.query("BEGIN;");

    // Create record in shipping_address table and return the id of the new record
    const { rows: shippingAddressQuery } = await client.query(
      `INSERT INTO shipping_address (address_line1, address_line2, city, postal_code, country)
      VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
      [address.addressLine1, address.addressLine2, address.city, address.postalCode, address.country]
    );
    const shippingAddressId = shippingAddressQuery[0].id;

    // Create record on order_details table and return the id of the new order
    const { rows: orderDetailsQuery } = await client.query(
      `INSERT INTO order_details (customer_id, shipping_address_id, total, status, created_at)
      VALUES ($1, $2, $3, DEFAULT, DEFAULT) RETURNING id;`,
      [customerId, shippingAddressId, shoppingSession.total]
    );
    const orderId = orderDetailsQuery[0].id;

    // Create records on order_items table for each item in the cart
    await Promise.all(cartItems.map(async (item) => {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity)
        VALUES ($1, $2, $3);`,
        [orderId, item.product_id, item.quantity]
      );
    }));

    // Delete items from cart_item table
    await Promise.all(cartItems.map(async (item) => {
      await client.query(
        "DELETE FROM cart_item WHERE id = $1;",
        [item.id]
      );
    }));

    // Set the total of shopping_session to zero
    await client.query(
      `UPDATE shopping_session
      SET total = 0, modified_at = DEFAULT
      WHERE id = $1;`,
      [shoppingSessionId]
    );

    await client.query("COMMIT;");
    return orderId;

  } catch(err) {
    await client.query("ROLLBACK;");
    throw err;

  } finally {
    client.release();
  }
};

// Check if an order exists
const isValidOrder = async (orderId) => {
  const { rows: orderDetailsQuery } = await db.query(
    "SELECT * FROM order_details WHERE id = $1",
    [orderId]
  );
  return orderDetailsQuery.length > 0 ? true : false;
};

// Check whether the order is associated with the provided customer ID
const isOrderOwner = async (orderId, customerId) => {
  const { rows: orderDetailsQuery } = await db.query(
    "SELECT customer_id FROM order_details WHERE id = $1;",
    [orderId]
  );
  return orderDetailsQuery[0].customer_id === customerId;
};

const getOrderById = async (orderId) => {
  // Get order details
  const { rows: orderDetailsQuery } = await db.query(
    "SELECT * FROM order_details WHERE id = $1;",
    [orderId]
  );
  const order = orderDetailsQuery[0];

  // Get shipping address
  const { rows: shippingAddressQuery } = await db.query(
    "SELECT * FROM shipping_address WHERE id = $1;",
    [order.shipping_address_id]
  );
  const shippingAddress = shippingAddressQuery[0];

  // Get order items
  const { rows: orderItemsQuery } = await db.query(
    "SELECT * FROM order_items WHERE order_id = $1;",
    [order.id]
  );
  // Add product details for each order item
  const orderItems = await Promise.all(
    orderItemsQuery.map(async (item) => {
      const product = await getProductById(item.product_id);
      return {
        product: { ...product },
        quantity: item.quantity
      }
    }));

  // Return a formatted order object
  return {
    id: order.id,
    total: parseFloat(order.total),
    status: order.status,
    createdAt: order.created_at,
    shippingAddress: {
      addressLine1: shippingAddress.address_line1,
      addressLine2: shippingAddress.address_line2,
      city: shippingAddress.city,
      postalCode: shippingAddress.postal_code,
      country: shippingAddress.country
    },
    items: orderItems
  };
};

// Get all order associated with a specific customer ID
const getOrdersByCustomerId = async (customerId) => {
  // Get the id of each order associated with the customer
  const { rows: orderDetailsQuery } = await db.query(
    "SELECT id FROM order_details WHERE customer_id = $1 ORDER BY created_at DESC;",
    [customerId]
  );
  if (orderDetailsQuery.length === 0) return [];
  const ordersId = orderDetailsQuery.map(order => order.id);

  // Iterate the query result and get full order for each orderId
  const orders = await Promise.all(ordersId.map(async (orderId) => {
    const order = await getOrderById(orderId);
    return order;
  }));
  
  return orders;
};

const getOrderStatusById = async (orderId) => {
  const { rows: orderDetailsQuery } = await db.query(
    "SELECT status FROM order_details WHERE id = $1;",
    [orderId]
  );
  return orderDetailsQuery[0].status;
};

const deleteOrderById = async (orderId) => {
  // Get the shipping address ID associated with the order
  const { rows: orderDetailsQuery } = await db.query(
    "SELECT shipping_address_id FROM order_details WHERE id = $1",
    [orderId]
  );
  const shippingAddressId = orderDetailsQuery[0].shipping_address_id;
  // Transaction: delete the order and the shipping address
  const client = await db.getClient();
  try {
    await client.query("BEGIN;");
    await client.query("DELETE FROM order_details WHERE id = $1;", [orderId]);
    await client.query("DELETE FROM shipping_address WHERE id = $1;", [shippingAddressId]);
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
  createOrder,
  isValidOrder,
  isOrderOwner,
  getOrderById,
  getOrdersByCustomerId,
  getOrderStatusById,
  deleteOrderById
};