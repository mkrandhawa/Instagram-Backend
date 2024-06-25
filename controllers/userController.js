const mongoose= require('mongoose');
const User = require('../models/userModel');


exports.registerUser = async(req, res, next)=>{

    const userData = req.body.user
    const user =  await User.create({
        emailPhone: userData.emailPhone,
        name: userData.name,
        username: userData.username,
        password: userData.password,
        dob: {
            month: userData.dob.month,
            day: userData.dob.day,
            year: userData.dob.year
        }

    })

    res.status(201).json({
        status:'success',
        data:{
            user
        }
    })
}