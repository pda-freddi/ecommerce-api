const app = require("../../app.js");
const supertest = require("supertest");
const request = supertest(app);

describe("Customer endpoints", () => {
  describe("CRUD customer operations happy path", () => {
    test("endpoints work as intended", async () => {
      // This test simulates a user interacting with all customer endpoints successively
      // from account creation to account deletion. It tests the "happy path".

      let response;

      // Create a new customer
      const customer = {
        "email": "newcustomer158599@example.com",
        "password": "Password123!",
        "confirmPassword": "Password123!",
        "firstName": "John",
        "lastName": "Doe",
        "birthDate": "1985-12-31",
        "phone": "+1-212-456-7890"
      };

      response = await request.post("/api/customer")
                         .set("Content-type", "application/json")
                         .send(customer);

      // Responds with 201 code if customer was created
      expect(response.status).toBe(201);

      // Login process
      const loginCredentials = {
        "email": "newcustomer158599@example.com",
        "password": "Password123!"
      };

      response = await request.post("/api/customer/login")
                         .set("Content-type", "application/json")
                         .send(loginCredentials);

      // Responds with 204 code and sets the cookie header
      expect(response.status).toBe(204);
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(response.headers["set-cookie"][0]).toMatch(/sessionId=.*?[^;]*/);

      const cookieString = response.headers["set-cookie"][0];
      const sessionId = cookieString.match(/sessionId=.*?[^;]*/)[0];

      // Get customer information
      response = await request.get("/api/customer")
                         .set("Cookie", sessionId);

      // Responds with 200 and a customer object
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.email).toBe("newcustomer158599@example.com");
      expect(response.body.firstName).toBe("John");

      // Update customer name
      const customerToUpdate = {
        "email": "newcustomer158599@example.com",
        "password": "Password123!",
        "confirmPassword": "Password123!",
        "firstName": "Mario",
        "lastName": "Doe",
        "birthDate": "1985-12-31",
        "phone": "+1-212-456-7890"
      };

      response = await request.put("/api/customer")
                        .set("Content-type", "application/json")
                        .set("Cookie", sessionId)
                        .send(customerToUpdate);
                                
      // Responds with 200 code if update was successful
      expect(response.status).toBe(200);

      // Get customer information again
      response = await request.get("/api/customer")
                         .set("Cookie", sessionId);

      // Responds with 200 code and the updated customer object
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.email).toBe("newcustomer158599@example.com");
      expect(response.body.firstName).toBe("Mario");

      // Delete customer
      response = await request.delete("/api/customer")
                         .set("Cookie", sessionId);

      // Responds with 204 and logs the customer out
      expect(response.status).toBe(204);

      // Try to get customer information again
      response = await request.get("/api/customer")
                         .set("Cookie", sessionId)

      // Responds with 401 code
      expect(response.status).toBe(401);
    });
  });

  describe("Data validation and security tests", () => {
    // These tests simulate a user interacting with the customer endpoints incorrectly.
    // They test the application's endurance to bad data input and if appropriate responses
    // are being handed out.
    describe("GET /customer", () => {
      it("responds unauthenticated requests with 401 code", async () => {
        const res = await request.get("/api/customer");
        // Responds with 401 status code and a message
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Authentication required to access this endpoint.");
      });
    });

    describe("POST /customer", () => {
      it("responds with 400 code if request body is missing required fields", async () => {
        // Missing email, firstName and birthDate
        const customer = {
          "password": "Password123!",
          "confirmPassword": "Password123!",
          "lastName": "Doe",
          "phone": "+1-212-456-7890"
        };
        const res = await request.post("/api/customer")
                            .set("Content-type", "application/json")
                            .send(customer);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Missing required field(s): email, firstName, birthDate");
      });

      it("responds with 400 code if request body has values of invalid type", async () => {
        // Phone is not a string and lastName is an empty string
        const customer = {
          "email": "newcustomer158599@example.com",
          "password": "Password123!",
          "confirmPassword": "Password123!",
          "firstName": "John",
          "lastName": "",
          "birthDate": "1985-12-31",
          "phone": 12124567890
        };
        const res = await request.post("/api/customer")
                            .set("Content-type", "application/json")
                            .send(customer);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid type for field(s): lastName, phone. Must be a non-empty string.");
      });

      it("responds with 400 code if an invalid email is provided", async () => {
        const customer = {
          "email": "not-an-email",
          "password": "Password123!",
          "confirmPassword": "Password123!",
          "firstName": "John",
          "lastName": "Doe",
          "birthDate": "1985-12-31",
          "phone": "+1-212-456-7890"
        };
        const res = await request.post("/api/customer")
                            .set("Content-type", "application/json")
                            .send(customer);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid e-mail.");
      });

      it("responds with 400 code if email is already registered", async () => {
        const customer = {
          "email": "testuser@example.com",
          "password": "Password123!",
          "confirmPassword": "Password123!",
          "firstName": "John",
          "lastName": "Doe",
          "birthDate": "1985-12-31",
          "phone": "+1-212-456-7890"
        };
        const res = await request.post("/api/customer")
                            .set("Content-type", "application/json")
                            .send(customer);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("This email is already registered to a customer.");
      });

      it("responds with 400 code if password and confirmPassword don't match", async () => {
        const customer = {
          "email": "newcustomer158599@example.com",
          "password": "Password123!",
          "confirmPassword": "Password456!",
          "firstName": "John",
          "lastName": "Doe",
          "birthDate": "1985-12-31",
          "phone": "+1-212-456-7890"
        };
        const res = await request.post("/api/customer")
                            .set("Content-type", "application/json")
                            .send(customer);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Password and confirm password fields don't match.");
      });

      it("responds with 400 code if a weak password is provided", async () => {
        // Weak password
        const customer = {
          "email": "newcustomer158599@example.com",
          "password": "weakpassword",
          "confirmPassword": "weakpassword",
          "firstName": "John",
          "lastName": "Doe",
          "birthDate": "1985-12-31",
          "phone": "+1-212-456-7890"
        };
        const res = await request.post("/api/customer")
                            .set("Content-type", "application/json")
                            .send(customer);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Password is too weak. Must be at least 8 characters long and contain one or more lowercase characters, uppercase characters, numbers and symbols.");
      });

      it("responds with 400 code if customer is not 18 years old or more", async () => {
        // Customer age is less than 18 years
        const customer = {
          "email": "newcustomer158599@example.com",
          "password": "Password123!",
          "confirmPassword": "Password123!",
          "firstName": "John",
          "lastName": "Doe",
          "birthDate": "2012-05-20",
          "phone": "+1-212-456-7890"
        };
        const res = await request.post("/api/customer")
                            .set("Content-type", "application/json")
                            .send(customer);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("You must be at least 18 years old to register.");
      });

      it("responds with 400 code if age is past the upper limit", async () => {
        // Birth date can't be before 1904-01-01
        const customer = {
          "email": "newcustomer158599@example.com",
          "password": "Password123!",
          "confirmPassword": "Password123!",
          "firstName": "John",
          "lastName": "Doe",
          "birthDate": "1900-01-01",
          "phone": "+1-212-456-7890"
        };
        const res = await request.post("/api/customer")
                            .set("Content-type", "application/json")
                            .send(customer);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Birth date must be after 01-01-1904.");
      });

      it("responds with 400 code if birth date is not in the required format", async () => {
        const customer = {
          "email": "newcustomer158599@example.com",
          "password": "Password123!",
          "confirmPassword": "Password123!",
          "firstName": "John",
          "lastName": "Doe",
          "birthDate": "31-12-1985",
          "phone": "+1-212-456-7890"
        };
        const res = await request.post("/api/customer")
                            .set("Content-type", "application/json")
                            .send(customer);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid birth date. Must be in the format YYYY-MM-DD.");
      });

      it("responds with 400 code if phone is not a valid number", async () => {
        // Phone number must follow the required format
        const customer = {
          "email": "newcustomer158599@example.com",
          "password": "Password123!",
          "confirmPassword": "Password123!",
          "firstName": "John",
          "lastName": "Doe",
          "birthDate": "1985-12-31",
          "phone": "2124567890"
        };
        const res = await request.post("/api/customer")
                            .set("Content-type", "application/json")
                            .send(customer);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Please provide a valid phone number in international format (e.g. +1-212-456-7890)");
      });
    });

    describe("PUT /customer", () => {
      // Data requirements for this endpoint are the same tested for the POST method
      it("responds unauthenticated requests with 401 code", async () => {
        const res = await request.put("/api/customer");
        // Responds with 401 status code and a message
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Authentication required to access this endpoint.");
      });
    });

    describe("DELETE /customer", () => {
      it("responds unauthenticated requests with 401 code", async () => {
        const res = await request.delete("/api/customer");
        // Responds with 401 status code and a message
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Authentication required to access this endpoint.");
      });
    });

    describe("POST /customer/login", () => {
      it("responds with 400 code if request body is missing required fields", async () => {
        // Missing password
        const customer = {
          "email": "newcustomer158599@example.com"
        };
        const res = await request.post("/api/customer/login")
                            .set("Content-type", "application/json")
                            .send(customer);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Missing required field(s): password");
      });

      it("responds with 400 code if email is not valid", async () => {
        // Missing password
        const customer = {
          "email": "notanemail",
          "password": "Password123!"
        };
        const res = await request.post("/api/customer/login")
                            .set("Content-type", "application/json")
                            .send(customer);
        // Responds with 400 code and a message
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid e-mail.");
      });

      it("responds with 401 code if authentication fails", async () => {
        // Missing password
        const customer = {
          "email": "newcustomer158599@example.com",
          "password": "Password123!"
        };
        const res = await request.post("/api/customer/login")
                            .set("Content-type", "application/json")
                            .send(customer);
        // Responds with 401 code and a message
        expect(res.status).toBe(401);
      });
    });

    describe("POST /customer/logout", () => {
      it("responds unauthenticated requests with 401 code", async () => {
        const res = await request.post("/api/customer/logout");
        // Responds with 401 status code and a message
        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Authentication required to access this endpoint.");
      });
    });
  });
});