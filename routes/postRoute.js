const express = require('express');
const postController = require('../controllers/postController');
const userController = require('../controllers/userController');


const router = express.Router();

router.get('/',  userController.protect, postController.getAll);

router.get('/:id', userController.protect, postController.getPost);

router.post('/uploadPost',  userController.protect, postController.uploadPost);

router.patch('/:id/saveUnsavePost', userController.protect, postController.saveUnsavePost);

router.patch('/:id/likeUnlikePost', userController.protect, postController.likeUnlikePost);



module.exports = router;