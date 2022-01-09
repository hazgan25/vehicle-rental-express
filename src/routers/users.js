const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/users');
const authorize = require('../middlewares/authorize');
const upload = require('../controllers/upload');

// post/insert
userRouter.post('/', authorize.checkToken, authorize.checkAdmin, userController.postNewUser);
userRouter.get('/', authorize.checkToken, authorize.checkAdmin, userController.getUser);
userRouter.get('/profile', authorize.checkToken, userController.getPersonalUser);
userRouter.put('/', authorize.checkToken, upload.uploadHandler, userController.updateUser);
userRouter.patch('/', authorize.checkToken, authorize.checkUser, userController.upgradeUser);
userRouter.delete('/', authorize.checkToken, userController.delUserById);

module.exports = userRouter;