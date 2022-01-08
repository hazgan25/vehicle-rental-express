const express = require('express');
const vehicleRouter = express.Router();
const vehicleController = require('../controllers/vehicles');
const authorize = require('../middlewares/authorize');
const upload = require('../controllers/upload');

vehicleRouter.post('/', authorize.checkToken, authorize.checkTenant, upload.uploadHandler, vehicleController.postNewVehicle);
vehicleRouter.get('/', vehicleController.getVehicle);
vehicleRouter.delete('/', authorize.checkToken, authorize.checkTenant, vehicleController.delVehicleById);
vehicleRouter.put('/', authorize.checkToken, authorize.checkTenant, upload.uploadHandler, vehicleController.updateVehicles);

module.exports = vehicleRouter;