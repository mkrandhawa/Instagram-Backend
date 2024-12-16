const User = require('../models/userModel');
const Story = require('../models/storyModel');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const multer = require('multer');

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

// Add and Remove Follower
exports.addRemoveFollower = async(req, res, next)=>{

    try{
        const userId = req.user.id;

        const id = req.params.id;

        const user = await User.findById(userId);

        const userToFollow = await User.findById(id);


        if(userId === id){

            next(res.status(400).json({
                status: 'Fail',
                message: 'You cannot follow yourself'
            }));
        }

        if(user && userToFollow){

            if(!user.following.includes(id)){

                const updatedUser = await User.updateOne(
                    {_id: userId},
                    {$push: {following: id}}, 
                    {new: true}
                );

                next(res.status(204).json({
                    status: 'Success',
                    message: 'Unfollowed successfully',
                    data: updatedUser
                }));

            }else{

                const updatedUser = await User.updateOne(
                    {_id: userId},
                    {$pull: {following: id}}, 
                    {new: true}
                );

                next(res.status(204).json({
                    status: 'Success',
                    message: 'Followed successfully',
                    data: updatedUser
                }));
            }

        }
    }catch (error) {
        res.status(500).json({
          status: "error",
          message: "An error occurred while removing/adding follower",
          error: error.message,
        });
      }
}

// Get Saved Posts

exports.getSavedPosts = async(req, res, next)=>{

    const userId = req.user.id;

    if(!userId){

        next( res.status(400).json({
            status: 'Fail',
            message: 'Please login/provide valid user ID!'
        }));
    }

    const user = await User.findById(userId).populate('savedPosts');

    res.status(200).json({
        status: 'Success',
        message: 'Request successful',
        data: user.savedPosts
    });
}

// Helper function to Upload Story

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/stories");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `story-${req.user.id}-${Date.now()}.${ext}`);
    }
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video') || file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('You can only upload a video/image file!'), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
}).single('story');  // 'story' is the name of the field


// Upload Story
exports.uploadStory = async (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                status: 'Fail',
                message: err.message || "File upload failed."
            });
        }

        // Check if the file exists
        if (!req.file) {
            return res.status(400).json({
                status: "fail",
                message: "A file (image or video) must be provided with the post.",
            });
        }

        const user = req.user.id;
        const file = req.file;  // Access the uploaded file from req.file

        try {
            // Create a new story entry with the file path
            const story = await Story.create({
                user,
                story: file.path,  // Store the file path or filename in the story
            });

            // Send the success response
            res.status(200).json({
                status: 'Success',
                message: 'Story added successfully',
                data: story
            });
        } catch (error) {
            next(error);  // Forward any error to the error handling middleware
        }
    });
};

// Get All Stories

exports.getAllStories = async(req, res, next) =>{

    const userId = req.user.id; 

    // Fetch the user and their following list
    const user = await User.findById(userId).populate('following');

    if (!user) {
        return res.status(404).json({
            status: 'Fail',
            message: 'User not found'
        });
    }

    // Get stories of the user and their following users
    const userAndFollowingIds = [userId, ...user.following.map(follow => follow._id)];

    const stories = await Story.find({ user: { $in: userAndFollowingIds } }).populate({path: 'user', select: 'username'}); // Populate user details if needed.

    res.status(200).json({
        status: 'Success',
        message: 'Stories fetched successfully',
        data: stories
    });
}

// Delete Story

exports.deleteStory = async(req, res, next)=>{

    const userId = req.user.id;

    const storyId = req.params.id;

    const story = await Story.findById(storyId);

    const isTheOwner = story.user._id.toString() === userId.toString();s

    if(!isTheOwner){

        next(res.status(401).json({
            status: 'Fail',
            message: 'You do not have permisison to delete this story!'
        }));

    }

    await Story.findByIdAndDelete(storyId);

    const updatedUser  = await User.findByIdAndUpdate(userId, {$pull:{stories: storyId}}, {new: true});

    res.status(200).json({
        status: 'Success',
        message: 'Story Deleted successfully',
        data: updatedUser
    });
    

}

// Get all following

exports.getFollowing = async(req, res, next)=>{

    const user = req.user.id;

    if(!user){

        next(res.status(400).json({
            status: 'Fail',
            message: 'You must be logged in!'
        }));
    }
    const following = await User.findById(user, 'following')
    .populate({ path: 'following', select: 'username picture' });
  

    res.status(200).json({
        status: 'Success',
        message: 'Your following retrieved successfully',
        following
    });

}

// Get not following

exports.getNotFollowing = async(req, res, next)=>{

    const user = req.user.id;

    if(!user){

        next(res.status(400).json({
            status: 'Fail',
            message: 'You must be logged in!'
        }));
    }

    const currentUser = await User.findById(user);
    const notFollowing = await User.find({_id:{$nin: [...currentUser.following, user]}}).limit(5);

    res.status(200).json({
        status: 'Success',
        message: 'Users that you are not following',
        data: notFollowing
    });

}
