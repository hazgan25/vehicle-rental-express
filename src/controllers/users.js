const userModel = require("../models/users");
const responseHelper = require("../helpers/sendResponse");

const detailPersonal = (req, res) => {
  const { id } = req.userInfo;
  userModel
    .userDataPersonal(id)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.error(res, status, err);
    });
};

const editUser = (req, res) => {
  const { body } = req;
  const { userInfo } = req;
  const file = req.file;
  userModel
    .editUserData(userInfo, body, file)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.success(res, status, err);
    });
};

const editPassword = (req, res) => {
  const { body } = req;
  const { id } = req.userInfo;
  userModel
    .editPasswordData(id, body)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.success(res, status, err);
    });
};

// upgrade user to role 3
const upgradeUser = (req, res) => {
  const { id } = req.userInfo;
  userModel
    .upgradeUsertoRenter(id)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.success(res, status, err);
    });
};

const deleteAccount = (req, res) => {
  const { id } = req.userInfo;
  const token = req.header("x-access-token");
  userModel
    .deleteAccountUser(id, token)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.success(res, status, err);
    });
};

module.exports = {
  detailPersonal,
  editUser,
  editPassword,
  upgradeUser,
  deleteAccount,
};
