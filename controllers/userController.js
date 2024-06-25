const mongoose= require('mongoose');
const User = require('../models/userModel');


// REGISTER THE USER
exports.registerUser = async(req, res, next)=>{

    const userData = req.body
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

// LOGIN THE USER
exports.login = async(req, res, next)=>{

    console.log(req.body)
 

    const {username, password} = req.body;
    console.log(username)

    //Check if the username or password fields are available
    if (!username || !password){
        return next(
            res.status(400).json({
                status: 'error',
                message: 'Missing username or password'
            })
        )
    }
    
    const user = await User.findOne({emailPhone: username}).select("+password");

    console.log('This is user',user)

    //Check if there is any user with that data
    if (!user || !(password === user.password)){
        return next ( 
            res.status(401).json({
                status:'error',
                message: 'Wrong email/username or password'
            })
        )
    }
    else{
        console.log('Logged in successfully')
        res.status(200).json({
            status: 'success',
        })
        
    }
}