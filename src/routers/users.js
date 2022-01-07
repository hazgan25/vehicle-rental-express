const express = require('express');
const userController = require('../controllers/users');
const userRouter = express.Router();
const authorize = require('../middlewares/authorize');
const uploadHandler = require('../controllers/upload');

// post/insert
userRouter.post('/', authorize.checkToken, authorize.checkAdmin, userController.postNewUser);
userRouter.get('/', authorize.checkToken, authorize.checkAdmin, userController.getUser);
userRouter.put('/', authorize.checkToken, uploadHandler, userController.updateUser);
userRouter.patch('/', authorize.checkToken, authorize.checkUser, userController.upgradeUser);
userRouter.delete('/', authorize.checkToken, userController.delUserById);

module.exports = userRouter;