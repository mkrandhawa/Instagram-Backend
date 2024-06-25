const mongoose = require("mongoose");
const express = require("express");
const userRoute = require('./routes/userRoute');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/v1/users', userRoute);

module.exports = app;
