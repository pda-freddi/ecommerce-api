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
  "SELECT id, email, first_name, last_name, birth_date, phone FROM customer WHERE id = $1;",
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
    phone: rows[0].phone
  };
  return customer;
};

const createCustomer = async (newCustomer) => {
  await db.query(
    `INSERT INTO customer (email, password, first_name, last_name, birth_date, phone)
    VALUES ($1, $2, $3, $4, $5, $6);`,
    [
      newCustomer.email,
      newCustomer.password,
      newCustomer.firstName,
      newCustomer.lastName,
      newCustomer.birthDate,
      newCustomer.phone
    ]
  );
  return true;
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
  await db.query("DELETE FROM customer WHERE id = $1", [id]);
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