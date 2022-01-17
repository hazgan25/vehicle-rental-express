const express = require('express');
const historyController = require('../controllers/history');
const historyRouter = express.Router();
const authorize = require('../middlewares/authorize');

historyRouter.post('/', authorize.checkToken, historyController.postNewHistory);
historyRouter.get('/', historyController.getHistory);
historyRouter.get('/popular', historyController.getPopularVehicle);
historyRouter.delete('/', authorize.checkToken, historyController.delHistoryById);

module.exports = historyRouter;