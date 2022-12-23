const responseHelper = require("../helpers/sendResponse");
const historyModel = require("../models/history");

// menambahkan data pembeli baru
const postNewHistory = (req, res) => {
  const { body, params } = req;
  const { id } = req.userInfo;
  historyModel
    .postNewHistory(body, id, params)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.error(res, status, err);
    });
};

// melihat data
const getHistory = (req, res) => {
  const { query, userInfo } = req;
  const { id } = userInfo;
  historyModel
    .getHistory(id, query)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.error(res, status, err);
    });
};

const getHistoryRenter = (req, res) => {
  const { query, userInfo } = req;
  const { id } = userInfo;
  historyModel
    .getHistoryRenterModel(id, query)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.error(res, status, err);
    });
};

const putHistoryByIdModel = (req, res) => {
  const { body, userInfo, params } = req;
  const historyID = params.id;
  const userId = userInfo.id;
  historyModel
    .putHistoryByIdModel(body, historyID, userId)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.error(res, status, err);
    });
};

const patchHistoryById = (req, res) => {
  const { body, userInfo, params } = req;
  const historyID = params.id;
  const userId = userInfo.id;
  historyModel
    .patchHistoryByIdModel(body, historyID, userId)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.error(res, status, err);
    });
};

const delHistoryById = (req, res) => {
  const { body, userInfo } = req;
  const userId = userInfo.id;
  historyModel
    .delHistoryById(body, userId)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.error(res, status, err);
    });
};

const delHistoryByIdRenter = (req, res) => {
  const { body, userInfo } = req;
  const userId = userInfo.id;
  historyModel
    .delHistoryByIdRenterModel(body, userId)
    .then(({ status, result }) => {
      responseHelper.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelper.error(res, status, err);
    });
};

module.exports = {
  postNewHistory,
  getHistory,
  getHistoryRenter,
  patchHistoryById,
  putHistoryByIdModel,
  delHistoryById,
  delHistoryByIdRenter,
};
