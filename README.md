# E-commerce RESTful API

This project consists of a RESTful API for a fictional e-commerce web application built with Node.js, Express.js and PostgreSQL.

The API exposes endpoints that provide basic functionality expected from an e-commerce app:

- User registration, login and data management.
- Categories and products data discovery and retrieval.
- Session tracking and shopping cart operations.
- Order creation and management.

The available endpoints and their documentation can be found in the `/api/docs` endpoint when running the application.

You can find a client application interacting with this API [here](https://github.com/Pedro-Freddi/ecommerce-client).

The project's plan and other relevant documents can be found in the [docs folder](./docs).

## Technologies

* Node v16.13.2
* Express v4.18.1
* PostgreSQL v14.4

Libraries used for specific features:

* [Jest](https://github.com/facebook/jest): testing framework.
* [Supertest](https://github.com/visionmedia/supertest): HTTP assertions for endpoint testing.
* [Bcrypt](https://github.com/kelektiv/node.bcrypt.js): password hashing.
* [Express-session](https://github.com/expressjs/session): session management.
* [Passport.js](https://github.com/jaredhanson/passport): customer authentication.
* [Dotenv](https://github.com/motdotla/dotenv): environment variables loading.
* [Node-postgres](https://github.com/brianc/node-postgres): PostgreSQL client for Node.
* [Validator.js](https://github.com/validatorjs/validator.js): string validation and sanitization.
* [Helmet](https://github.com/helmetjs/helmet): middleware to configure security related HTTP headers.
* [Nodemon](https://github.com/remy/nodemon): automatic application restart on file changes for ease of development.

## OpenAPI Specification

<img src="./docs/api-specification/openapi-spec-preview.png" alt="OpenAPI Specification preview" width=500px height=405px />

The OpenAPI Specification for this project is in the [openapi.yaml](./docs/api-specification/openapi.yaml) file.

## Database Schema

<img src="./docs/database/database-schema.png" alt="Database schema" width=500px height=490px />

[Diagram on dbdiagram.io](https://dbdiagram.io/d/62bdd5c669be0b672c77022f)

The scripts for database setup can be found [here](./docs/database/scripts).

## Running the Application Locally

To run this application you must have Node.js 16+ and PostgreSQL 14 installed on your machine.

1. Clone this repository:
```
git clone https://github.com/Pedro-Freddi/ecommerce-api.git
cd ecommerce-api
```

2. Install dependencies:
```
npm install
```

3. Add missing environments variables values specified in `/config/EXAMPLE.env` and rename the file to `.env`.

4. Run [database-setup.sql](./docs/database/scripts/database-setup.sql) script in PostgreSQL client to set up the database.

5. Connect to the new `ecommerce` database using the `ecommerce_admin` role and run [tables.sql](./docs/database/scripts/tables.sql) and [populate-tables.sql](./docs/database/scripts/populate-tables.sql) scripts in PostgreSQL client to create and populate tables, respectively.

6. Run the application and navigate to `http://localhost:8000` (or the port you set in the .env file) on your browser.
```
npm start
```
7. Navigate to `http://localhost:8000/api/docs` to check out the API documentation and endpoints.
