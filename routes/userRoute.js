const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();


router.get('/home', userController.isLoggedIn);

router.post('/login', userController.login);

router.post('/signup', userController.registerUser);



module.exports = router;