const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({ path: "./config.env" });

//CONNECTING TO ATLAS DB
const DB = process.env.DATABASE;

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.error("DB connection error: ", err));

//Defining the port number
const port = 4000 || process.env.PORT;

//Starting the sever
const server = app.listen(port, "localhost", () => {
  console.log(`Server is running on port ${port}`);
});
