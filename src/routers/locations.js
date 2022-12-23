const express = require("express");
const locationRouter = express.Router();
const locationController = require("../controllers/locations");
const authorize = require("../middlewares/authorize");

locationRouter.post(
  "/",
  authorize.checkToken,
  authorize.checkRenter,
  locationController.addNewLocation
);
locationRouter.get(
  "/",
  authorize.checkToken,
  authorize.checkRenter,
  locationController.listLocationByRenter
);
locationRouter.get("/all", locationController.listLocationAll);
locationRouter.get(
  "/:id",
  authorize.checkToken,
  locationController.locationById
);
locationRouter.get(
  "/name/:name",
  authorize.checkToken,
  locationController.locationByName
);
locationRouter.put(
  "/",
  authorize.checkToken,
  authorize.checkRenter,
  locationController.editNameLocation
);
locationRouter.delete("/:id", authorize.checkToken, authorize.checkRenter);

module.exports = locationRouter;
