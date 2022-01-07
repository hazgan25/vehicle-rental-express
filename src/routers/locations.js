const express = require('express');
const locationsConstroller = require('../controllers/locations');
const locationsRouter = express.Router();
const authorize = require('../middlewares/authorize');

locationsRouter.post('/', authorize.checkToken, locationsConstroller.postNewLocation);
locationsRouter.get('/', locationsConstroller.getLocations);
locationsRouter.delete('/', authorize.checkToken, locationsConstroller.delLocationById);

module.exports = locationsRouter;