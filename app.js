const mongoose = require("mongoose");
const express = require("express");
const userRoute = require('./routes/userRoute');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require("path");

const app = express();
// app.use(cors());

//SERVING STATIC FILES accessing the static files
app.use(express.static(path.join(__dirname, "public")));

app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true // Allow cookies to be sent cross-origin
}));


app.use(express.json());
app.use(cookieParser());



app.use('/api/v1/users', userRoute);

module.exports = app;
