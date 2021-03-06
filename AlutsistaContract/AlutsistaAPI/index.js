const express = require("express");
const app = express();

app.get("/", (req, res) => res.send("My first REST API!"));

const port = 8000;
app.listen(port, () => {
  console.log("Listening on port " + port);
});
