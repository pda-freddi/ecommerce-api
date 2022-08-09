# E-commerce RESTful API Project Plan

## Table of Contents
1. [Summary](#summary)
2. [Implementation](#implementation)
3. [Database Schema](#database-schema)
4. [OpenAPI Specification](#openapi-specification)

## Summary

The goal of this project is to develop a RESTful API for a fictional e-commerce web application using Node.js, Express and PostgreSQL.

The API will provide basic functionality expected from an e-commerce app: 

- User registration, login and data management.
- Categories and products data discovery and retrieval.
- Session tracking and shopping cart operations.
- Order creation and management.

For simplification, it'll be assumed that payment processing is handled by a third-party and this application won't be concerned with those details.

Other features that were considered and might be included in future improvements to the project are:

- User reviews for products.
- Many-to-many relationship between products and categories.
- Detailed options and specifications for products (e.g. color, size, shipping options).
- Endpoints for product inventory and product discount management.
- Endpoints for customers to manage multiple shipping addresses.
- Administrative endpoints for categories, products, customers and orders remote data management.

## Implementation

A PostgreSQL database will comprise the data layer of the application. The database's schema will be designed using the [dbdiagram.io](https://dbdiagram.io/d) tool and the database will be implemented through the [psql](https://www.postgresql.org/docs/current/app-psql.html) CLI for PostgreSQL.

The application's server layer will be implemented on [Node.js](https://nodejs.org/en/) environment. [Express.js](https://expressjs.com/) will provide the server's basic routing functionality and useful middleware available for Express will provide session management ([express-session](https://expressjs.com/en/resources/middleware/session.html)) and authentication ([Passport.js](http://www.passportjs.org/)). The database integration will be handled with the [node-postgres](https://node-postgres.com/) library.

Regarding the API, a design first approach will be followed for its development since it's mission critical for the proper functioning of the application and should have the expected functionality well planned upfront. The [OpenAPI specification](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md) will be implemented with the help of [Swagger Editor](https://editor.swagger.io/) tool.

For testing, [Jest](https://jestjs.io/) will be used as the general test framework and the [SuperTest](https://github.com/visionmedia/supertest) library will assist with the API endpoint testing. Manual testing will also be performed with the [Postman](https://www.postman.com/) application.

Finally, [Git](https://git-scm.com/) will be used as the project's version control system.

## Database Schema

<img src="./database/database-schema.png" alt="Database schema" width=500px height=490px />

[Diagram on dbdiagram.io](https://dbdiagram.io/d/62bdd5c669be0b672c77022f)

[This article](https://fabric.inc/blog/ecommerce-database-design-example/) was of great help on how to design a database schema for an e-commerce application.

## OpenAPI Specification

<img src="./api-specification/openapi-spec-preview.png" alt="OpenAPI Specification preview" width=500px height=405px />

The OpenAPI Specification for this project is in the [openapi.yaml](./api-specification/openapi.yaml) file. You can read and interact with the specification in [this link](https://ecommerce-api-pdafr.herokuapp.com/api/docs/).