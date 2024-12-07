const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();


router.get('/home', userController.isLoggedIn);

router.get('/all-users', userController.protect, userController.getAll);

router.get('/savedPosts', userController.protect, userController.getSavedPosts);

router.patch('/:id/addRemoveFollower', userController.protect, userController.addRemoveFollower);

router.post('/login', userController.login);

router.post('/signup', userController.registerUser);




module.exports = router;