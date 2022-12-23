const adminModel = require("../models/admin");
const responseHelper = require("../helpers/sendResponse");

const detailAllUser = (req, res) => {
  const { query } = req;
  adminModel
    .detailAllUserData(query)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.error(res, status, err);
    });
};

const createUser = (req, res) => {
  const { body } = req;
  adminModel
    .create(body)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.error(res, status, err);
    });
};

const editPassword = (req, res) => {
  const { body } = req;
  const { userInfo } = req;
  adminModel
    .editPasswordUser(body, userInfo)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.error(res, status, err);
    });
};

const deleteUser = (req, res) => {
  const { body } = req;
  const { userInfo } = req;
  adminModel
    .deleteUserAccount(body, userInfo)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.error(res, status, err);
    });
};

module.exports = {
  detailAllUser,
  createUser,
  editPassword,
  deleteUser,
};
