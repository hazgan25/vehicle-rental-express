const adminModel = require('../models/admin')
const responseHelper = require('../helpers/sendResponse')

const detailAllUser = (req, res) => {
    const { query } = req
    adminModel
        .detailAllUserData(query)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result)
        })
        .catch(({ status, err }) => {
            responseHelper.error(res, status, err)
        })
}

const createUser = (req, res) => {
    const { body } = req
    adminModel
        .create(body)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result)
        })
        .catch(({ status, err }) => {
            responseHelper.error(res, status, err)
        })
}

module.exports = {
    detailAllUser,
    createUser
}