const express = require('express');
const vehicleController = require('../controllers/vehicles');
const authorize = require('../middlewares/authorize');
const vehicleRouter = express.Router();

vehicleRouter.post('/', authorize.checkToken, authorize.checkAdmin, vehicleController.postNewVehicle);
vehicleRouter.get('/', vehicleController.getVehicle);
vehicleRouter.delete('/', authorize.checkToken, vehicleController.delVehicleById);
vehicleRouter.put('/', authorize.checkToken, vehicleController.updateVehicles);

module.exports = vehicleRouter;