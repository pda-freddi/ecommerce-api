CREATE TABLE customer (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email varchar UNIQUE NOT NULL,
  password varchar NOT NULL,
  first_name varchar NOT NULL,
  last_name varchar,
  birth_date date NOT NULL,
  phone varchar
);

CREATE TABLE category (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar UNIQUE NOT NULL,
  display_name varchar UNIQUE NOT NULL,
  description text
);

CREATE TABLE product (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar UNIQUE NOT NULL,
  display_name varchar UNIQUE NOT NULL,
  SKU varchar UNIQUE NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  description text,
  image varchar,
  thumbnail varchar,
  in_stock boolean DEFAULT true,
  category_id int NOT NULL REFERENCES category ON DELETE RESTRICT
);

CREATE TABLE shipping_address (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  address_line1 varchar NOT NULL,
  address_line2 varchar,
  city varchar NOT NULL,
  postal_code varchar NOT NULL,
  country varchar NOT NULL
);

CREATE TABLE order_details (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id int NOT NULL REFERENCES customer ON DELETE CASCADE,
  shipping_address_id int NOT NULL REFERENCES shipping_address ON DELETE RESTRICT,
  total numeric NOT NULL,
  status varchar DEFAULT 'pending',
  created_at timestamp DEFAULT NOW()
);

CREATE TABLE order_items (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id int NOT NULL REFERENCES order_details ON DELETE CASCADE,
  product_id int NOT NULL REFERENCES product ON DELETE RESTRICT,
  quantity int DEFAULT 1,
  UNIQUE (order_id, product_id)
);

CREATE TABLE shopping_session (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id int NOT NULL UNIQUE REFERENCES customer ON DELETE CASCADE,
  total numeric DEFAULT 0,
  created_at timestamp DEFAULT NOW(),
  modified_at timestamp DEFAULT NOW()
);

CREATE TABLE cart_item (
  id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  shopping_session_id int NOT NULL REFERENCES shopping_session ON DELETE CASCADE,
  product_id int NOT NULL REFERENCES product ON DELETE RESTRICT,
  quantity int DEFAULT 1
);

CREATE TABLE session (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX IDX_session_expire ON session (expire);