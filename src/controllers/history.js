const responseHelper = require('../helpers/sendResponse')
const historyModel = require('../models/history')

// menambahkan data pembeli baru
const postNewHistory = (req, res) => {
    const { body } = req
    const { id } = req.userInfo
    historyModel
        .postNewHistory(body, id)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result)
        })
        .catch(({ status, err }) => {
            res.status(status).json({ msg: "Terjadi Error", err })
        })
}

// melihat data
const getHistory = (req, res) => {
    const { query } = req;
    historyModel
        .getHistory(query)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result)
        }).catch(({ status, err }) => {
            responseHelper.error(res, status, err)
        })
}

const getPopularVehicle = (req, res) => {
    const { query } = req
    historyModel
        .getPopularVehicle(query)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result)
        })
        .catch(({ status, err }) => {
            responseHelper.error(res, status, err)
        })
}

const delHistoryById = (req, res) => {
    const { query } = req
    const idHistory = query.id
    historyModel
        .delHistoryById(idHistory)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result)
        }).catch(({ status, err }) => {
            responseHelper.error(res, status, err)
        });
}

module.exports = {
    postNewHistory,
    getHistory,
    getPopularVehicle,
    delHistoryById
};