const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();


router.get('/home', userController.isLoggedIn);

router.get('/all-users', userController.protect, userController.getAll);

router.patch('/follow', userController.protect, userController.addFollower);

router.post('/login', userController.login);

router.post('/signup', userController.registerUser);




module.exports = router;