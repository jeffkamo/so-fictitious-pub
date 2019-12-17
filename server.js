const app = require("./app.js");

const PORT = 5000;
app.listen(PORT, function() {
  console.log("Your Xero basic public app is running at localhost:" + PORT);
});
