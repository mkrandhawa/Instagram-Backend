const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();


router.get('/home', userController.isLoggedIn);

router.get('/all-users', userController.protect, userController.getAll);

router.get('/savedPosts', userController.protect, userController.getSavedPosts);

router.get('/getAllStories', userController.protect, userController.getAllStories);

router.get('/following', userController.protect, userController.getFollowing);

router.get('/notFollowing', userController.protect, userController.getNotFollowing);

router.patch('/:id/addRemoveFollower', userController.protect, userController.addRemoveFollower);

router.post('/login', userController.login);

router.post('/signup', userController.registerUser);

router.post('/uploadStory', userController.protect, userController.uploadStory);

router.delete('/:id/delete', userController.protect, userController.deleteStory);




module.exports = router;