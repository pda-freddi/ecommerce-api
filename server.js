// Import app and initialize on designated PORT
const app = require("./app.js");

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});