const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/users')
const { checkToken } = require('../middlewares/authorize')
const { uploadHandleUsers } = require('../controllers/upload')

userRouter.get('/profile', checkToken, userController.detailPersonal)
userRouter.patch('/edit', checkToken, uploadHandleUsers, userController.editUser)
userRouter.put('/edit/password', checkToken, userController.editPassword)
userRouter.delete('/delete', checkToken, userController.deleteAccount)

module.exports = userRouter