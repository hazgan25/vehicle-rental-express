const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/auth');
const validate = require('../middlewares/validate');

// router auth
authRouter.post('/user/', validate.register, authController.registerUser); //register sebagai users
authRouter.post('/admin/', validate.register, authController.registerAdmin); //register admin
authRouter.post('/login', authController.login);
authRouter.post('/logout',);

module.exports = authRouter;