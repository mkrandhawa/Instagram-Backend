const express = require('express');
const postController = require('../controllers/postController');
const userController = require('../controllers/userController');


const router = express.Router();

router.get('/',  userController.protect, postController.getPosts);

router.post('/uploadPost',  userController.protect, postController.uploadPost);

router.patch('/:id/saveUnsavePost', userController.protect, postController.saveUnsavePost);



module.exports = router;