const locationModel = require("../models/locations");
const responseHelper = require("../helpers/sendResponse");

const addNewLocation = (req, res) => {
  let { body, userInfo } = req;
  const { id } = userInfo;
  locationModel
    .addNewLocationModel(body, id)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch((status, err) => {
      responseHelper.error(res, status, err);
    });
};

const listLocationAll = (req, res) => {
  locationModel
    .listLocationAllModel()
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch((status, err) => {
      responseHelper.error(res, status, err);
    });
};

const locationById = (req, res) => {
  const { id } = req.params;
  locationModel
    .locationByIdModel(id)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch((status, err) => {
      responseHelper.error(res, status, err);
    });
};

const locationByName = (req, res) => {
  const { name } = req.params;
  locationModel
    .locationByNameModel(name)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch((status, err) => {
      responseHelper.error(res, status, err);
    });
};

const listLocationByRenter = (req, res) => {
  const { id } = req.userInfo;
  locationModel
    .listLocationByRenterModel(id)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch((status, err) => {
      responseHelper.error(res, status, err);
    });
};

const editNameLocation = (req, res) => {
  const { userInfo, body } = req;
  const { id } = userInfo;
  locationModel
    .editNameLocationModel(body, id)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch((status, err) => {
      responseHelper.error(res, status, err);
    });
};

module.exports = {
  addNewLocation,
  listLocationAll,
  locationById,
  locationByName,
  listLocationByRenter,
  editNameLocation,
};
