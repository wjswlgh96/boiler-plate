const express = require("express");
const app = express();
const port = 4000;

const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://wjswlgh96:abcd1234@boilerplate.yu14t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connect Success!"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World! 안녕하세요~!!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
