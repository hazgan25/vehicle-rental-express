const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/auth');
const validate = require('../middlewares/validate');
const authorize = require('../middlewares/authorize')

// router auth
authRouter.post('/user', validate.register, authController.registerUser); //register sebagai users
authRouter.post('/admin', validate.register, authController.registerAdmin); //register admin
authRouter.post('/login', authController.login);
authRouter.delete('/logout', authorize.logout);

module.exports = authRouter;