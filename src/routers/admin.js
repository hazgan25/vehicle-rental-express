const express = require('express')
const adminRouter = express.Router()
const adminController = require('../controllers/admin')
const { checkToken, checkAdmin } = require('../middlewares/authorize')

adminRouter.get('/users', checkToken, checkAdmin, adminController.detailAllUser)
adminRouter.post('/create', checkToken, checkAdmin, adminController.createUser)

module.exports = adminRouter