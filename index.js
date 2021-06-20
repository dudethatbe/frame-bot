require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || process.env.REDIRECT_PORT;

app.get("*", (req, res) => {
  res.redirect(process.env.REDIRECT_URL);
});
app.listen(port, () => {
  console.log(
    `waiting to redirect requests on port ${port} to ${process.env.REDIRECT_URL}`
  );
});
