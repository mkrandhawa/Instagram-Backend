const express = require('express');
const postController = require('../controllers/postController');
const userController = require('../controllers/userController');


const router = express.Router();


router.get('/',  userController.protect, postController.getAll);

router.get('/:id', userController.protect, postController.getPost);

router.get('/:id/comments', userController.protect, postController.getAllCommentsOnPost);

router.post('/uploadPost',  userController.protect, postController.uploadPost);

router.post('/:id/comment', userController.protect, postController.addComment);

router.patch('/:id/saveUnsavePost', userController.protect, postController.saveUnsavePost);

router.patch('/:id/likeUnlikePost', userController.protect, postController.likeUnlikePost);

router.delete('/:id/comment/:commentId', userController.protect, postController.deleteComment);




module.exports = router;