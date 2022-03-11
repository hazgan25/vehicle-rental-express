const vehicleModel = require('../models/vehicles');
const responseHelper = require('../helpers/sendResponse');

// menambahkan kendaraan baru
const addNewVehicle = (req, res) => {
    let { body, userInfo, files } = req
    const { id } = userInfo
    vehicleModel
        .addNewVehicleModel(body, files, id)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result)
        }).catch((status, err) => {
            responseHelper.error(res, status, err)
        })
}

const listVehicle = (req, res) => {
    const { query } = req
    vehicleModel
        .listVehicleModels(query)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result)
        }).catch(({ status, err }) => {
            responseHelper.error(res, status, err)
        })
}

const vehicleDetail = (req, res) => {
    const { id } = req.params
    vehicleModel
        .vehicleDetailModel(id)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result)
        }).catch(({ status, err }) => {
            responseHelper.error(res, status, err)
        })
}

const updateVehicles = (req, res) => {
    let { body, userInfo, files } = req
    const { id } = userInfo
    vehicleModel
        .updateVehicles(body, id, files)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result)
        }).catch(({ status, err }) => {
            responseHelper.success(res, status, err)
        })
}

// menghapus data kendaraan byId
const delVehicleById = (req, res) => {
    const { query, userInfo } = req
    const { id } = userInfo
    const idVehicle = query.id

    vehicleModel
        .delVehicleById(idVehicle, id)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result)
        }).catch(({ status, err }) => {
            responseHelper.error(res, status, err)
        });
}

module.exports = {
    addNewVehicle,
    listVehicle,
    vehicleDetail,
    updateVehicles,
    delVehicleById
};