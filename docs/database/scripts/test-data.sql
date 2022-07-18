/*
This test data is only for database testing purposes and does not fully comply
with the application's data schema and requirements.
*/

-- Creating customer records
INSERT INTO customer (email, password, first_name, last_name, birth_date, phone)
VALUES
  ('john.doe@example.com', 'dJSusyNSI7568sUF&Swsuis', 'John', 'Doe', '1985-10-29', '404-505-2550'),
  ('jane.mary@example.com', 'SDM976scusy&ns8ASdfsa', 'Jane', 'Mary', '1974-05-15', '851-871-0564'),
  ('mario.step@example.com', 'jJSUhsmaHSAIn7284cs7s', 'Mario', 'Step', '1955-12-26', '741-045-6587');

-- Populating category table
INSERT INTO category (name, display_name, description)
VALUES
  ('clothes', 'Clothes', 'All kinds of fabric and styles'),
  ('shoes', 'Shoes', 'For the modern human being'),
  ('hats', 'Hats', 'To avoid sunburn');

-- Populating product table
INSERT INTO product (name, display_name, SKU, price, in_stock, category_id)
VALUES
  ('leather-jacket', 'Leather Jacket', 'JDFUSA54865', 89.99, DEFAULT, 1),
  ('cotton-t-shirt', 'Cotton T-Shirt', 'GASDA71268', 39.99, DEFAULT, 1),
  ('pajama-pants', 'Pajama Pants', 'UDYAS874227', 19.99, DEFAULT, 1);

INSERT INTO product (name, display_name, SKU, price, in_stock, category_id)
VALUES
  ('flip-flops', 'Flip Flops', 'DUAYS8177821', 29.99, DEFAULT, 2),
  ('running-shoes', 'Running Shoes', 'FUQYAS75628', 49.99, DEFAULT, 2),
  ('leather-boots', 'Leather Boots', 'JFUYSA48595', 69.99, DEFAULT, 2);

INSERT INTO product (name, display_name, SKU, price, in_stock, category_id)
VALUES
  ('baseball-cap', 'Baseball Cap', 'HIDUSH83721', 15.99, DEFAULT, 3),
  ('sombrero', 'Sombrero', 'CSANUDAH343242', 29.99, DEFAULT, 3),
  ('fedora', 'Fedora', 'SUGNA88322', 39.99, DEFAULT, 3);

-- Initializing a session and adding items to cart
INSERT INTO shopping_session (customer_id, total, created_at, modified_at)
VALUES (1, DEFAULT, DEFAULT, DEFAULT);

INSERT INTO cart_item (shopping_session_id, product_id, quantity)
VALUES
  (1, 1, 1),
  (1, 8, 2),
  (1, 2, 1);

UPDATE shopping_session SET total = 189.96 WHERE id = 1;

-- Placing an order
WITH 
first_shipping_address_id AS (
  INSERT INTO shipping_address (address_line1, city, postal_code, country) 
  VALUES ('163 Fake Street', 'FakersVille', '14857-774', 'Fakeland')
  RETURNING id
),
first_order_id AS (
  INSERT INTO order_details (customer_id, shipping_address_id, total, status, created_at)
  VALUES (1, (SELECT id FROM first_shipping_address_id), 189.96, DEFAULT, DEFAULT)
  RETURNING id
)
INSERT INTO order_items (order_id, product_id, quantity)
VALUES 
  ((SELECT id FROM first_order_id), 1, DEFAULT),
  ((SELECT id FROM first_order_id), 8, 2),
  ((SELECT id FROM first_order_id), 2, DEFAULT);