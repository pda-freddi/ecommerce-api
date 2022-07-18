const dotenv = require("dotenv");

// Load env variables
dotenv.config({ path: "./config/.env" });

// App start
const app = require("./app.js");
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});