const Post = require('../models/postModel');
const User = require('../models/userModel');
const multer = require('multer');


// GetAll Posts 

exports.getAll = async(req, res, next)=>{
    

    const loggedUserId = req.user.id

    const loggedInUser = await User.findById(loggedUserId).select("following");
    const following = loggedInUser.following; // List of user IDs

    if(following){
        const posts = await Post.find({user: {$in: following}})
                                .populate('user', 'name username picture');

        res.status(200).json({
            status: 'success',
            data: posts
        });
    }
    else{
        res.status(200).json({
            status: 'success',
            message: 'There are no posts yet'
           
        });
    }
};

// Get Post

exports.getPost = async (req, res, next)=>{

  const userId = req.user.id;

  const postId = req.params.id;

  if (!userId || !postId){

    next(res.status(400).json({
      status: 'Fail',
      message: 'Login or provide a valid post ID'
    }));
    return;
  }

  const user = await User.findById(userId);

  const post = await Post.findById(postId);

  if(!user || !post){

    next(res.status(500).json({
      status: 'Fail',
      message: 'No User/Post found!'
    }));
    return;
  }

  res.status(200).json({
    status: 'Success',
    message: 'Post found!',
    data: post
  });

};

// Configure multer storage and file filter

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images/posts"); // Folder where files will be stored
    },
    filename: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1];
      cb(null, `post-${req.user.id}-${Date.now()}.${ext}`); // Format: post-userId-timestamp.extension
    },
});
  
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
      cb(null, true);
    } else {
      cb(
        new Error("Not a valid file type! Please upload an image or video."),
        false
      );
    }
};
  
// Initialize multer instance
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
}).array("images", 20); // Handle array file uploads with field name "media"


// Upload Posts

exports.uploadPost = async (req, res, next) => {
  // Use multer to handle the file upload
  
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        status: "fail",
        message: err.message || "File upload failed.",
      });
    }

    try {
      const user = req.user.id;
      const { description } = req.body;

      if (!req.files) {
        return res.status(400).json({
          status: "fail",
          message: "A file (image or video) must be provided with the post.",
        });
      }

      const posts = req.files.map((file) => file.path)
      // Create the post with the uploaded file's details
      const post = await Post.create({
        description, 
        user, 
        images: posts
      });

      res.status(201).json({
        status: "success",
        data: {
          post,
        },
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Failed to upload the post.",
        error: error.message,
      });
    }
  });
};

// Save/Unsave Post 

exports.saveUnsavePost = async(req, res, next)=>{

  let updatedUser;

  const userId = req.user.id;

  const postId = req.params.id;

  if(!userId || !postId){
    next(res.status(400).json({
      status: 'Fail',
      message: 'Please provide a valid postId or login before saving a post'
    }));
  }

  const user = await User.findById(userId);

  const post = await Post.findById(postId);

  if(!user || !post){
    next(res.status(500).json({
      status: 'Fails',
      message: 'User/Post not found!'
    }));
  }

  const isPostSaved = user.savedPosts.includes(postId);

  if (!isPostSaved){

    updatedUser = await user.updateOne({$push: {savedPosts: postId}}, {new: true});

    next(res.status(200).json({
      status: 'Success',
      message: 'Post saved successfully',
      data: updatedUser
    }));
  }else{

    updatedUser = await user.updateOne({$pull:{savedPosts: postId}}, {new: true}); 

    next(res.status(200).json({
      status: 'Success',
      message: 'Post saved successfully',
      data: updatedUser
    }));
  }
};

// Like/UnLike a Post

exports.likeUnlikePost = async (req, res, next)=>{

  let updatedUser;

  const userId = req.user.id;

  const postId = req.params.id;

  if(!userId || !postId){
    
    next(res.staus(400).json({
      status: 'Fail',
      message: 'Please login/provide post ID'
    }));
  }

  const user = await User.findById(userId);

  const post = await Post.findById(postId);

  if(!user || !post){

    next(res.status(500).json({
      status: 'Fail',
      message: 'No user/post found'
    }));
  }

  const isPostLiked = user.likedPosts.includes(postId);

  if(!isPostLiked){

    updatedUser = await user.updateOne({$push:{likedPosts: postId}}, {new: true});

    next(res.status(200).json({
      status: 'Success',
      message: 'Post liked!',
      data: updatedUser
    }));

  } else {

    updatedUser = await user.updateOne({$pull:{likedPosts: postId}}, {new: true});

    next(res.status(200).json({
      status: 'Success',
      message: 'Post unliked!',
      data: updatedUser
    }));

  }

};