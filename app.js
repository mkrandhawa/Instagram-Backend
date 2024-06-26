const mongoose = require("mongoose");
const express = require("express");
const userRoute = require('./routes/userRoute');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
// app.use(cors());

app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend origin
    credentials: true // Allow cookies to be sent cross-origin
}));


app.use(express.json());
app.use(cookieParser());



app.use('/api/v1/users', userRoute);

module.exports = app;
