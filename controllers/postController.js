const Post = require('../models/postModel');
const User = require('../models/userModel');
const multer = require('multer');



exports.getPosts = async(req, res, next)=>{
    

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
}

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
  }).single("post"); // Handle single file uploads with field name "media"



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
        const user = req.user.id; // Authenticated user's ID
        const { description } = req.body; // Extract the description from the request body
  
        if (!req.file) {
          return res.status(400).json({
            status: "fail",
            message: "A file (image or video) must be provided with the post.",
          });
        }
  
        // Create the post with the uploaded file's details
        const post = await Post.create({
          description, // Post description
          user, // User creating the post
          post: req.file.filename, // Save the filename (image or video)
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