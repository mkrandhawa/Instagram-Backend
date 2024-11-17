const mongoose = require("mongoose");
const express = require("express");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require("path");
const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');


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
app.use('/api/v1/posts', postRoute);

module.exports = app;
