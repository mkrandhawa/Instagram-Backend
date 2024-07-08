const mongoose= require('mongoose');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');

//SIGNING JWT
const signJWT= (id)=>{
    return jwt.sign({id}, process.env.SECRET_KEY,{
        expiresIn: process.env.EXPIRY
    })
}

// CREATING JWT
const createJWT = (user, statusCode, res) =>{
    const token = signJWT(user._id);

    const expiry = parseInt(process.env.EXPIRY);

    const expiryTime = expiry * 24 * 60 * 60 * 1000;

    const cookieJwt = {
        expires: new Date( Date.now() + expiryTime),
        httpOnly:true
    }

    res.cookie('jwt', token, cookieJwt);

    user.password  = undefined;

    res.status(statusCode).json({
        status: 'success',
        jwt: token,
        data:{
            user
        }
    })
}


// REGISTER THE USER
exports.registerUser = async(req, res, next)=>{

    try{

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

    createJWT(user, 201, res)

    
    }
    catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error
            const field = Object.keys(error.keyPattern)[0];
            res.status(400).json({
                status: 'error',
                message: `The ${field} already exists. Please choose another one.`
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    }
}


// LOGIN THE USER
exports.login = async(req, res, next)=>{
    try{

    const {username, password} = req.body;

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


    //Check if there is any user with that data
    if (!user || !(await user.correctPassword(password, user.password))){
        return next ( 
            res.status(401).json({
                status:'error',
                message: 'Wrong email/username or password'
            })
        )
    }
    else{
        console.log('Logged in successfully')

        createJWT(user, 200, res);
        
    }
    }
    catch (error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
    
}


// PROTECT THE PAGE RESTRICTED TO LOGGED IN USERS ONLY
exports.protect = async(req, res, next) =>{
    let token;
    if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") //JWT is mostly in the header and starts with "Bearer"
    ) {
    token = req.headers.authorization.split(" ")[1]; //getting the JWT
    } else if (req.cookies.jwt) {
    token = req.cookies.jwt; //If all previous case are not available get the JWT from the cookie
    }

    //Check if the token exists
    if (!token) {
    return next(
        res.status(401).json({
            status: 'fail',
            message: 'You are not logged in! Please login to get access'
        })
    );
    }

    //2)Validate the token - Verification stage verify if the data has been manipulated or expired
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);

    //3) Check if the user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
    return next(
        res.status(401).json({
            status: 'fail',
            message: 'The user belonging to this token no longer exists'
        })
        
    );
    }

    //Grant access to the protected route
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
}

// CHECK IF THE USER IS LOGGED IN
exports.isLoggedIn = async (req, res, next) => {
    //If there is no cookie there is no logged in user
    if (req.cookies.jwt) {
      try {
        //1)verifies the token
        const decoded = await promisify(jwt.verify)(
          req.cookies.jwt,
          process.env.SECRET_KEY
        );
  
        //2) Check if the user still exists
        const freshUser = await User.findById(decoded.id);
        if (!freshUser) {
          return next();
        }
  
        // //3)Check if user changed password after the JWT was issued#
        // //iat => issued at
        // if (freshUser.changedPasswordAfter(decoded.iat)) {
        //   return next();
        // }

        //THERE IS A LOGGED IN USER
        res.locals.user = freshUser;
        res.status(200).json({
            status:'success',
            message: 'The user is logged',
            jwt: req.cookies.jwt,
            data:{
                freshUser
            }
        })
        return next();
      } catch (err) {
        return next();
      }
    }
    next();
  };

// GET ALL USERS

exports.getAll = async(req, res, next)=>{   
        try{
            
            const currentUser = req.user._id
            const users = await User.find({_id:{$ne:currentUser}});

            res.status(200).json({
                status: 'success',
                data:{
                    users
                }
            })
            
        }catch (err){
            res.status(500).json({
                status: 'fail',
                message: err.message,
            });
        }
    
}

