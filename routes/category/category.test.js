"use strict";

const app = require("../../app.js");
const supertest = require("supertest");
const request = supertest(app);

describe("Category endpoints", () => {
  describe("GET /category", () => {
    it("responds with an array of all categories", async () => {
      const res = await request.get("/api/category");
      // Response should be an array of category objects
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[0].name).toBeDefined();
    });
  });

  describe("GET /category/{categoryName}", () => {
    it("responds with an array of products contained in the category", async () => {
      const categoryName = "shoes";
      const res = await request.get(`/api/category/${categoryName}`);
      // Response should be an array of product objects
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[0].price).toBeDefined();
    });

    it("responds with 404 code if no categories match the provided name", async () => {
      const categoryName = "invalid-category-123"
      const res = await request.get(`/api/category/${categoryName}`);
      // Response should contain a message
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No products found in this category.");
    });
  });
});

