const db = require("../../config/database.js");
const { formatCustomers } = require("../../helpers/formatData.js");

// Validates if an email address is registered to a customer
const isCustomer = async (email) => {
  const { rows: customerQuery } = await db.query(
    "SELECT email FROM customer WHERE email = $1;",
    [email]
  );
  return customerQuery.length > 0 ? true : false;
};

// This query returns the customer's password. Should only be used for login process
const getCustomerByEmail = async (email) => {
  const { rows: customerQuery } = await db.query(
    "SELECT id, email, password FROM customer WHERE email = $1;",
    [email]
  );
  if (customerQuery.length === 0) return false;
  return customerQuery[0];
};

const getCustomerById = async (id) => {
  const { rows: customerQuery } = await db.query(
    `SELECT 
      customer.id AS id, 
      customer.email AS email, 
      customer.first_name AS first_name,
      customer.last_name AS last_name,
      customer.birth_date AS birth_date,
      customer.phone AS phone,
      shopping_session.id AS shopping_session_id
    FROM customer
    INNER JOIN shopping_session
      ON customer.id = shopping_session.customer_id
    WHERE customer.id = $1;`,
      [id]
  );
  if (customerQuery.length === 0) return false;
  const formattedCustomers = formatCustomers(customerQuery);
  return formattedCustomers[0];
};

const createCustomer = async (customer) => {
  const client = await db.getClient();
  // Transaction: create customer record and a shopping session associated with it
  try {
    await client.query("BEGIN;");
    const { rows: customerQuery } = await client.query(
      `INSERT INTO customer (email, password, first_name, last_name, birth_date, phone)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`,
      [
        customer.email,
        customer.password,
        customer.firstName,
        customer.lastName,
        customer.birthDate,
        customer.phone
      ]
    );
    await client.query(
    `INSERT INTO shopping_session (customer_id, total, created_at, modified_at)
    VALUES ($1, DEFAULT, DEFAULT, DEFAULT);`,
    [customerQuery[0].id]);
    await client.query("COMMIT;");
    return true;

  } catch(err) {
    await client.query("ROLLBACK;");
    throw err;

  } finally {
    client.release();
  }
};

const updateCustomerById = async (customer, customerId) => {
  await db.query(
    `UPDATE customer SET email = $1, password = $2, first_name = $3, 
    last_name = $4, birth_date = $5, phone = $6 WHERE id = $7;`,
    [
      customer.email,
      customer.password,
      customer.firstName,
      customer.lastName,
      customer.birthDate,
      customer.phone,
      customerId
    ]
  );
  return true;
};

const deleteCustomerById = async (customerId) => {
  await db.query("DELETE FROM customer WHERE id = $1;", [customerId]);
  return true;
};

module.exports = {
  isCustomer,
  getCustomerByEmail,
  getCustomerById,
  createCustomer,
  updateCustomerById,
  deleteCustomerById
};