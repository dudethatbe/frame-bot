require("dotenv").config();
const express = require("express");
const app = express();

app.get("*", (req, res) => {
  res.redirect(process.env.REDIRECT_URL);
});
app.listen(process.env.PORT || process.env.REDIRECT_PORT, () => {
  console.log(
    `waiting to redirect requests on port ${process.env.REDIRECT_PORT} to ${process.env.REDIRECT_URL}`
  );
});
