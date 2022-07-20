const app = require("../app.js");
const supertest = require("supertest");
const request = supertest(app);

const getTestCookie = async () => {
  const loginCredentials = {
    "email": process.env.TESTUSER,
    "password": process.env.TESTPASSWORD
  };

  const res = await request.post("/api/customer/login")
                      .set("Content-type", "application/json")
                      .send(loginCredentials);

  const cookieString = res.headers["set-cookie"][0];
  const sessionId = cookieString.match(/sessionId=.*?[^;]*/)[0];

  return sessionId;
};

module.exports = { getTestCookie };