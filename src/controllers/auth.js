const authModel = require('../models/auth');
const responseHelprer = require('../helpers/sendResponse');

// buat akun khusus user
const registerUser = (req, res) => {
    const { body } = req;
    authModel
        .createNewUser(body)
        .then(({ status, result }) => {
            const objectResponse = {
                id: result.insertId,
                name: body.name,
                email: body.email,
            };
            responseHelprer.success(res, status, objectResponse);
        })
        .catch(({ status, err }) => {
            responseHelprer.error(res, status, err);
        })
}

// buat akun khusus admin
const registerAdmin = (req, res) => {
    const { body } = req;
    authModel
        .createNewAdmin(body)
        .then(({ status, result }) => {
            const objectResponse = {
                id: result.insertId,
                name: body.name,
                email: body.email,
            };
            responseHelprer.success(res, status, objectResponse);
        })
        .catch(({ status, err }) => {
            responseHelprer.error(res, status, err);
        })
}

const login = (req, res) => {
    const { body } = req;
    authModel
        .signIn(body)
        .then(({ status, result }) => {
            responseHelprer.success(res, status, result);
        })
        .catch(({ status, err }) => {
            responseHelprer.error(res, status, err);
        })
}

const logout = () => {

}

module.exports = {
    registerUser,
    registerAdmin,
    login,
    logout,
}