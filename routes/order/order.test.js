"use strict";

const app = require("../../app.js");
const supertest = require("supertest");
const request = supertest(app);
const { getTestCookie } = require("../../helpers/testUtils.js");

describe("Order endpoints", () => {
  describe("CRUD order operations happy path", () => {
    test("endpoints work as intended", async () => {
      // This test simulates a user interacting with all order endpoints successively.
      // It tests the "happy path".

      let response;

      // Log in and establish a session
      const sessionId = await getTestCookie();

      // Get all orders
      response = await request.get("/api/order")
                         .set("Cookie", sessionId);
      // Responds with 200 code and an array of order objects. Array should be empty for now
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);

      // Add an item to the cart
      const item = { "productId": 2, "quantity": 1 };
      response = await request.post("/api/cart")
                         .set("Content-type", "application/json")
                         .set("Cookie", sessionId)
                         .send(item);
      // Responds with 201 code
      expect(response.status).toBe(201);

      // Create a new order
      const shippingAddress = {
        "addressLine1": "123 Imaginary St",
        "city": "Fakesville",
        "postalCode": "93306",
        "country": "Fake Land"
      };
      response = await request.post("/api/order")
                         .set("Content-type", "application/json")
                         .set("Cookie", sessionId)
                         .send(shippingAddress);
      // Responds with 201 and the orderId
      expect(response.status).toBe(201);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.orderId).toBeDefined();

      const orderId = response.body.orderId;

      // Get all orders again
      response = await request.get("/api/order")
                         .set("Cookie", sessionId);
      // Responds with 200 code and the orders array. Should contain the new order
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(orderId);

      // Get the new order by ID
      response = await request.get(`/api/order/${orderId}`)
                         .set("Cookie", sessionId);
      // Responds with 200 code and an order object
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.id).toBe(orderId);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBeGreaterThan(0);

      // Delete the order
      response = await request.delete(`/api/order/${orderId}`)
                         .set("Cookie", sessionId);
      // Responds with 204 code
      expect(response.status).toBe(204);

      // Get all orders again
      response = await request.get("/api/order")
                         .set("Cookie", sessionId);
      // Responds with 200 code and the orders array, which should be empty again
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });
  });

  describe("Data validation and security tests", () => {
    // These tests simulate a user interacting with the order endpoints incorrectly.
    // They test the application's endurance to bad data input and if appropriate responses
    // are being handed out.
    describe("GET /order", () => {
      it("responds unauthenticated requests with 401 code", async () => {
        const res = await request.get("/api/order");
        // Responds with 401 status code and a message
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Authentication required to access this endpoint.");
      });
    });

    describe("POST /order", () => {
      it("responds unauthenticated requests with 401 code", async () => {
        const res = await request.post("/api/order");
        // Responds with 401 status code and a message
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Authentication required to access this endpoint.");
      });

      it("responds with 400 code if request body is missing required fields", async () => {
        // Missing city and country
        const shippingAddress = {
          "addressLine1": "123 Imaginary St",
          "postalCode": "93306"
        };
        const sessionId = await getTestCookie();
        const res = await request.post("/api/order")
                            .set("Content-type", "application/json")
                            .set("Cookie", sessionId)
                            .send(shippingAddress);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Missing required field(s): city, country");
      });

      it("responds with 400 code if request body has values of invalid type", async () => {
        // Invalid types for postal code and country
        const shippingAddress = {
          "addressLine1": "123 Imaginary St",
          "city": "Fakesville",
          "postalCode": 93306,
          "country": ["Fake Land", "Another Country"]
        };
        const sessionId = await getTestCookie();
        const res = await request.post("/api/order")
                            .set("Content-type", "application/json")
                            .set("Cookie", sessionId)
                            .send(shippingAddress);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid type for field(s): postalCode, country. Must be a non-empty string.");
      });

      it("responds with 400 code if request body has a value with an empty string", async () => {
        // AddressLine2 has an empty string for value
        const shippingAddress = {
          "addressLine1": "123 Imaginary St",
          "addressLine2": "",
          "city": "Fakesville",
          "postalCode": "93306",
          "country": "Fake Land"
        };
        const sessionId = await getTestCookie();
        const res = await request.post("/api/order")
                            .set("Content-type", "application/json")
                            .set("Cookie", sessionId)
                            .send(shippingAddress);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid type for field(s): addressLine2. Must be a non-empty string.");
      });

      it("responds with 400 code if postal code is invalid", async () => {
        // Invalid postal code
        const shippingAddress = {
          "addressLine1": "123 Imaginary St",
          "city": "Fakesville",
          "postalCode": "000000000",
          "country": "Fake Land"
        };
        const sessionId = await getTestCookie();
        const res = await request.post("/api/order")
                            .set("Content-type", "application/json")
                            .set("Cookie", sessionId)
                            .send(shippingAddress);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid postal code.");
      });

      it("responds with 400 code if the shopping cart is empty", async () => {
        // Invalid postal code
        const shippingAddress = {
          "addressLine1": "123 Imaginary St",
          "city": "Fakesville",
          "postalCode": "93306",
          "country": "Fake Land"
        };
        const sessionId = await getTestCookie();
        const res = await request.post("/api/order")
                            .set("Content-type", "application/json")
                            .set("Cookie", sessionId)
                            .send(shippingAddress);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Shopping cart is empty.");
      });
    });

    describe("GET /order/{orderId}", () => {
      it("responds unauthenticated requests with 401 code", async () => {
        const res = await request.get("/api/order/1");
        // Responds with 401 status code and a message
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Authentication required to access this endpoint.");
      });

      it("responds with 400 code if the itemId parameter contains an invalid value", async () => {
        const sessionId = await getTestCookie();
        const res = await request.get("/api/order/not-a-number")
                            .set("Cookie", sessionId);
        // Responds with 400 status code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid value for orderId path parameter.");
      });

      it("responds with 403 code if the order does not belong to the customer", async () => {
        const sessionId = await getTestCookie();
        const res = await request.get("/api/order/1")
                            .set("Cookie", sessionId);
        // Responds with 403 status code and a message
        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Not authorized to access this order.");
      });

      it("responds with 404 code if the order does not exist", async () => {
        const sessionId = await getTestCookie();
        const res = await request.get("/api/order/1500000")
                            .set("Cookie", sessionId);
        // Responds with 404 status code and a message
        expect(res.status).toBe(404);
        expect(res.body.message).toBe("No order found with this ID.");
      });
    });

    describe("DELETE /order/{orderId}", () => {
      it("responds unauthenticated requests with 401 code", async () => {
        const res = await request.delete("/api/order/1");
        // Responds with 401 status code and a message
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Authentication required to access this endpoint.");
      });

      it("responds with 400 code if the itemId parameter contains an invalid value", async () => {
        const sessionId = await getTestCookie();
        const res = await request.delete("/api/order/not-a-number")
                            .set("Cookie", sessionId);
        // Responds with 400 status code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid value for orderId path parameter.");
      });

      it("responds with 403 code if the order does not belong to the customer", async () => {
        const sessionId = await getTestCookie();
        const res = await request.delete("/api/order/1")
                            .set("Cookie", sessionId);
        // Responds with 403 status code and a message
        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Not authorized to access this order.");
      });

      it("responds with 404 code if the order does not exist", async () => {
        const sessionId = await getTestCookie();
        const res = await request.delete("/api/order/1500000")
                            .set("Cookie", sessionId);
        // Responds with 404 status code and a message
        expect(res.status).toBe(404);
        expect(res.body.message).toBe("No order found with this ID.");
      });
    });
  });
});