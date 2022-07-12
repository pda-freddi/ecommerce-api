const db = require("../../database/index.js");

const isCustomer = async (email) => {
  const { rows } = await db.query(
    "SELECT email FROM customer WHERE email = $1;",
    [email]
  );
  return rows.length > 0 ? true : false;
};

// This query returns sensitive customer information. Should only be used for login process
const getCustomerByEmail = async (email) => {
  const { rows } = await db.query(
    "SELECT id, email, password FROM customer WHERE email = $1;",
    [email]
  );
  if (rows.length === 0) return false;
  return rows[0];
};

const getCustomerById = async (id) => {
  const { rows } = await db.query(
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
  if (rows.length === 0) return false;
  // Format birth date
  const date = new Date(rows[0].birth_date);
  const [ year, month, day ] = [date.getFullYear(), date.getMonth(), date.getDate()];
  const formattedBirthDate = `${year}-${month + 1}-${day}`;
  const customer = {
    id: rows[0].id,
    email: rows[0].email,
    firstName: rows[0].first_name,
    lastName: rows[0].last_name,
    birthDate: formattedBirthDate,
    phone: rows[0].phone,
    shoppingSessionId: rows[0].shopping_session_id
  };
  return customer;
};

const createCustomer = async (newCustomer) => {
  const client = await db.getClient();
  try {
    await client.query("BEGIN;");
    const { rows } = await client.query(
      `INSERT INTO customer (email, password, first_name, last_name, birth_date, phone)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`,
      [
        newCustomer.email,
        newCustomer.password,
        newCustomer.firstName,
        newCustomer.lastName,
        newCustomer.birthDate,
        newCustomer.phone
      ]
    );
    await client.query(
    `INSERT INTO shopping_session (customer_id, total, created_at, modified_at)
    VALUES ($1, DEFAULT, DEFAULT, DEFAULT);`,
    [rows[0].id]);
    await client.query("COMMIT;");
    return true;
  } catch(err) {
    await client.query("ROLLBACK;");
    throw err;
  } finally {
    client.release();
  }
};

const updateCustomerById = async (customer, id) => {
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
      id
    ]
  );
  return true;
};

const deleteCustomerById = async (id) => {
  await db.query("DELETE FROM customer WHERE id = $1;", [id]);
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