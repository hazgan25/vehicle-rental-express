const express = require('express')
const historyController = require('../controllers/history')
const historyRouter = express.Router()
const authorize = require('../middlewares/authorize')

historyRouter.post('/:id', authorize.checkToken, historyController.postNewHistory)
historyRouter.get('/', authorize.checkToken, historyController.getHistory)
historyRouter.patch('/:id', authorize.checkToken, historyController.patchHistoryById)
historyRouter.delete('/', authorize.checkToken, historyController.delHistoryById)

module.exports = historyRouter