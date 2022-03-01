const vehicleModel = require('../models/vehicles');
const responseHelper = require('../helpers/sendResponse');

// menambahkan kendaraan baru
const postNewVehicle = (req, res) => {
    let { body, userInfo, files } = req
    const { id } = userInfo
    vehicleModel
        .postNewVehicle(body, files, id)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result);
        }).catch((status, err) => {
            responseHelper.error(res, status, err);
        })
}

const getVehicle = (req, res) => {
    const { query } = req;
    vehicleModel
        .getVehicle(query)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result);
        }).catch(({ status, err }) => {
            responseHelper.error(res, status, err);
        })
}

const updateVehicles = (req, res) => {
    let { body, userInfo, files } = req;
    const { id } = userInfo
    vehicleModel
        .updateVehicles(body, id, files)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result);
        }).catch(({ status, err }) => {
            responseHelper.success(res, status, err);
        })
}

// menghapus data kendaraan byId
const delVehicleById = (req, res) => {
    const { query } = req;
    const { id } = req.userInfo;

    const idVehicle = query.id;
    vehicleModel
        .delVehicleById(idVehicle, id)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result);
        }).catch(({ status, err }) => {
            responseHelper.error(res, status, err);
        });
}

module.exports = {
    postNewVehicle,
    getVehicle,
    updateVehicles,
    delVehicleById
};