-- Create role to manage the database
CREATE ROLE ecommerce_admin LOGIN;

-- Create role to read and modify tables
CREATE ROLE ecommerce_app LOGIN;

-- Create the 'ecommerce' database
CREATE DATABASE ecommerce OWNER ecommerce_admin;

/*
Note: after running this script, an appropriate password should be set for each role 
to secure the login process.
*/