const express = require('express')
const authRouter = express.Router()
const authController = require('../controllers/auth')
const { register } = require('../middlewares/validate')
const { checkToken } = require('../middlewares/authorize')

authRouter.post('/register', register, authController.register)
authRouter.post('/register/admin', register, authController.registerAdmin)
authRouter.post('/login', authController.login)
authRouter.delete('/logout', checkToken, authController.logout)

module.exports = authRouter