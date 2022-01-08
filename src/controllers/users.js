const userModel = require("../models/users");
const responseHelper = require('../helpers/sendResponse');


// menambahkan user
const postNewUser = (req, res) => {
    const { body } = req;
    userModel
        .postNewUser(body)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result);
        }).catch(({ status, err }) => {
            responseHelper.error(res, status, err);
        })
}

const getUser = (req, res) => {
    const { query } = req;
    userModel
        .getUser(query)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result);
        }).catch(({ status, err }) => {
            responseHelper.error(res, status, err);
        })
}

// mengubah multi user
const updateUser = (req, res) => {
    let { body } = req;
    const { id } = req.userInfo;
    const file = req.file;

    userModel
        .updateUser(body, id, file)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result);
        }).catch(({ status, err }) => {
            responseHelper.success(res, status, err);
        })
}

// upgrade Users role 3
const upgradeUser = (req, res) => {
    const { id } = req.userInfo;
    userModel
        .upgradeUser(id)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result);
        }).catch(({ status, err }) => {
            responseHelper.success(res, status, err);
        })
}


// menghapus akun
const delUserById = (req, res) => {
    const { id } = req.userInfo;
    userModel
        .delUserById(id)
        .then(({ status, result }) => {
            responseHelper.success(res, status, result);
        }).catch(({ status, err }) => {
            responseHelper.error(res, status, err);
        });
}



module.exports = {
    postNewUser,
    getUser,
    updateUser,
    upgradeUser,
    delUserById
};
