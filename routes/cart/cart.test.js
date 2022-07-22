"use strict";

const app = require("../../app.js");
const supertest = require("supertest");
const request = supertest(app);
const { getTestCookie } = require("../../helpers/testUtils.js");

describe("Cart endpoints", () => {
  describe("CRUD cart operations happy path", () => {
    test("endpoints work as intended", async () => {
      // This test simulates a user interacting with all cart endpoints successively.
      // It tests the "happy path".

      let response;

      // Log in and establish a session
      const sessionId = await getTestCookie();

      // Get cart
      response = await request.get("/api/cart")
                         .set("Cookie", sessionId);
      // Responds with 200 code and a cart object that should have no items
      expect(response.status).toBe(200);
      expect(response.body.total).toBe(0);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBe(0);

      // Add an item to the cart
      const itemToAdd = {
        "productId": 2,
        "quantity": 1
      };
      response = await request.post("/api/cart")
                         .set("Content-type", "application/json")
                         .set("Cookie", sessionId)
                         .send(itemToAdd);
      // Responds with 201 code
      expect(response.status).toBe(201);

      // Get cart again and check if it was updated
      response = await request.get("/api/cart")
                         .set("Cookie", sessionId);
      // Responds with 200 code and a cart object that should have one item
      expect(response.status).toBe(200);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].quantity).toBe(1);

      const cartItemId = response.body.items[0].id;

      // Update quantity of the cart item that was just created
      const itemToUpdate = { "quantity": 2 };
      response = await request.put(`/api/cart/${cartItemId}`)
                         .set("Content-type", "application/json")
                         .set("Cookie", sessionId)
                         .send(itemToUpdate);
      // Responds with 204 code
      expect(response.status).toBe(204);

      // Get cart again and check if it was updated
      response = await request.get("/api/cart")
                         .set("Cookie", sessionId);
      // Responds with 200 code and a cart object that should contain the updated item
      expect(response.status).toBe(200);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].quantity).toBe(2);

      // Delete the cart item
      response = await request.delete(`/api/cart/${cartItemId}`)
                         .set("Cookie", sessionId);
      // Responds with 204 code
      expect(response.status).toBe(204);

      // Get cart again and check if item was deleted
      response = await request.get("/api/cart")
                         .set("Cookie", sessionId);
      // Responds with 200 code and a cart object that should have no items again
      expect(response.status).toBe(200);
      expect(response.body.total).toBe(0);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBe(0);

    });
  });

  describe("Data validation and security tests", () => {
    // These tests simulate a user interacting with the cart endpoints incorrectly.
    // They test the application's endurance to bad data input and if appropriate responses
    // are being handed out.
    describe("GET /cart", () => {
      it("responds unauthenticated requests with 401 code", async () => {
        const res = await request.get("/api/cart");
        // Responds with 401 status code and a message
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Authentication required to access this endpoint.");
      });
    });

    describe("POST /cart", () => {
      it("responds unauthenticated requests with 401 code", async () => {
        const res = await request.post("/api/cart");
        // Responds with 401 status code and a message
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Authentication required to access this endpoint.");
      });

      it("responds with 400 code if request body is missing the productId field", async () => {
        const sessionId = await getTestCookie();
        const cartItem = {
          "quantity": 1
        };
        const res = await request.post("/api/cart")
                            .set("Cookie", sessionId)
                            .send(cartItem);
        // Responds with 400 status code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("ProductId field is missing or has an invalid value.");
      });

      it("responds with 400 code if request body is missing the quantity field", async () => {
        const sessionId = await getTestCookie();
        const cartItem = {
          "productId": 2
        };
        const res = await request.post("/api/cart")
                            .set("Cookie", sessionId)
                            .send(cartItem);
        // Responds with 400 status code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Quantity field is missing or has an invalid value.");
      });

      it("responds with 400 code if request body contains a value of invalid type", async () => {
        const sessionId = await getTestCookie();
        const cartItem = {
          "productId": [1, 2],
          "quantity": 1
        };
        const res = await request.post("/api/cart")
                            .set("Cookie", sessionId)
                            .send(cartItem);
        // Responds with 400 status code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("ProductId field is missing or has an invalid value.");
      });

      it("responds with 400 code if quantity value is over 500", async () => {
        const sessionId = await getTestCookie();
        const cartItem = {
          "productId": 2,
          "quantity": 650
        };
        const res = await request.post("/api/cart")
                            .set("Cookie", sessionId)
                            .send(cartItem);
        // Responds with 400 status code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Quantity field is missing or has an invalid value.");
      });

      it("responds with 400 code if product does not exist", async () => {
        const sessionId = await getTestCookie();
        const cartItem = {
          "productId": 15000,
          "quantity": 1
        };
        const res = await request.post("/api/cart")
                            .set("Cookie", sessionId)
                            .send(cartItem);
        // Responds with 400 status code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Can't find a product with this productId.");
      });
    });

    describe("PUT /cart/{cartItemId}", () => {
      it("responds unauthenticated requests with 401 code", async () => {
        const res = await request.put("/api/cart/2");
        // Responds with 401 status code and a message
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Authentication required to access this endpoint.");
      });

      it("responds with 400 code if itemId path parameter is invalid", async () => {
        const sessionId = await getTestCookie();
        const body = {
          "quantity": 2
        };
        const res = await request.put("/api/cart/not-valid-item-id")
                            .set("Cookie", sessionId)
                            .send(body);
        // Responds with 400 and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid value for itemId path parameter.");
      });

      it("responds with 400 code if request body is missing the quantity field", async () => {
        const sessionId = await getTestCookie();
        const body = {};
        const res = await request.put("/api/cart/15")
                            .set("Cookie", sessionId)
                            .send(body);
        // Responds with 400 and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Quantity field is missing or has an invalid value.");
      });

      it("responds with 400 code if quantity field is 0", async () => {
        const sessionId = await getTestCookie();
        const body = {
          "quantity": 0
        };
        const res = await request.put("/api/cart/15")
                            .set("Cookie", sessionId)
                            .send(body);
        // Responds with 400 and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Quantity field is missing or has an invalid value.");
      });

      it("responds with 404 code if cart item does not exist", async () => {
        const sessionId = await getTestCookie();
        const body = {
          "quantity": 2
        };
        const res = await request.put("/api/cart/1500000")
                            .set("Cookie", sessionId)
                            .send(body);
        // Responds with 404 and a message
        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Can't find a cart item with the ID value provided.");
      });

      it("responds with 403 code if cart item does not belong to customer", async () => {
        const sessionId = await getTestCookie();
        const body = {
          "quantity": 2
        };
        const res = await request.put("/api/cart/5")
                            .set("Cookie", sessionId)
                            .send(body);
        // Responds with 403 and a message
        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Not authorized to update this cart item.");
      });
    });

    describe("DELETE /cart/{cartItemId}", () => {
      it("responds unauthenticated requests with 401 code", async () => {
        const res = await request.delete("/api/cart/2");
        // Responds with 401 status code and a message
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Authentication required to access this endpoint.");
      });

      it("responds with 400 code if itemId path parameter is invalid", async () => {
        const sessionId = await getTestCookie();
        const res = await request.delete("/api/cart/not-valid-item-id")
                            .set("Cookie", sessionId);
        // Responds with 400 and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid value for itemId path parameter.");
      });

      it("responds with 404 code if cart item does not exist", async () => {
        const sessionId = await getTestCookie();
        const res = await request.delete("/api/cart/1500000")
                            .set("Cookie", sessionId)
        // Responds with 404 and a message
        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Can't find a cart item with the ID value provided.");
      });

      it("responds with 403 code if cart item does not belong to customer", async () => {
        const sessionId = await getTestCookie();
        const res = await request.delete("/api/cart/5")
                            .set("Cookie", sessionId);
        // Responds with 403 and a message
        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Not authorized to delete this cart item.");
      });
    });
  });
});