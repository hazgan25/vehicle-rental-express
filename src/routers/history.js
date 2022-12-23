const express = require("express");
const historyController = require("../controllers/history");
const historyRouter = express.Router();
const authorize = require("../middlewares/authorize");

historyRouter.post(
  "/:id",
  authorize.checkToken,
  historyController.postNewHistory
);
historyRouter.get("/", authorize.checkToken, historyController.getHistory);
historyRouter.get(
  "/renter",
  authorize.checkToken,
  authorize.checkRenter,
  historyController.getHistoryRenter
);
historyRouter.put(
  "/:id",
  authorize.checkToken,
  authorize.checkRenter,
  historyController.putHistoryByIdModel
);
historyRouter.patch(
  "/:id",
  authorize.checkToken,
  historyController.patchHistoryById
);
historyRouter.delete(
  "/",
  authorize.checkToken,
  historyController.delHistoryById
);
historyRouter.delete(
  "/renter",
  authorize.checkToken,
  authorize.checkRenter,
  historyController.delHistoryByIdRenter
);

module.exports = historyRouter;
