const app = require("../../app.js");
const supertest = require("supertest");
const request = supertest(app);

describe("Product endpoints", () => {
  describe("GET /product", () => {
    it("responds with an array of all products", async () => {
      const res = await request.get("/api/product");
      // Response should be an array of product objects
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[0].name).toBeDefined();
      expect(res.body[0].price).toBeDefined();
    });

    it("responds with products that match a search term", async () => {
      const searchTerm = "leather";
      const res = await request.get(`/api/product?search=${searchTerm}`);
      // Response should be an array of product objects
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].id).toBeDefined();
      expect(res.body[0].name).toMatch(searchTerm);
      expect(res.body[0].price).toBeDefined();
    });

    it("responds with 404 code if no products match the search term", async () => {
      const searchTerm = "invalid-search-term-123";
      const res = await request.get(`/api/product?search=${searchTerm}`);
      // Response should contain a message
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No products found.");
    });
  });

  describe("GET /product/{productName}", () => {
    it("responds with the product object with a matching name", async () => {
      const productName = "leather-jacket";
      const res = await request.get(`/api/product/${productName}`);
      // Response should be a product object
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe(productName);
      expect(res.body.price).toBeDefined();
    });

    it("responds with 404 code if no products match the provided name", async () => {
      const productName = "invalid-product-name-123";
      const res = await request.get(`/api/product/${productName}`);
      // Response should contain a message
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No product found with this name.");
    });
  });

  describe("GET /product/id/{productId}", () => {
    it("responds with the product object with a matching ID", async () => {
      const productId = 5;
      const res = await request.get(`/api/product/id/${productId}`);
      // Response should be a product object
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.id).toBe(productId);
      expect(res.body.name).toBeDefined();
      expect(res.body.price).toBeDefined();
    });

    it("responds with 400 code if an invalid ID value is provided", async () => {
      const productId = -5;
      const res = await request.get(`/api/product/id/${productId}`);
      // Response should contain a message
      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid value for productId path parameter.");
    });

    it("responds with 404 code if no products match the provided ID", async () => {
      const productId = 25000;
      const res = await request.get(`/api/product/id/${productId}`);
      // Response should contain a message
      expect(res.status).toBe(404);
      expect(res.body.message).toBe("No product found with this ID.");
    });
  });
});