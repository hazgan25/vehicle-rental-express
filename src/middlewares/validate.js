const responseHelprer = require('../helpers/sendResponse');


const register = (req, res, next) => {
    const { body } = req;
    const registerBody = ['phone', 'email', 'password'];
    const bodyProperty = Object.keys(body);
    const isBodyValid =
        registerBody.filter((property) => !bodyProperty.includes(property))
            .length == 0 ? true : false;
    if (!isBodyValid) return responseHelprer.error(res, 400, "Invalid Body");
    next();
}

const login = (req, res, next) => {
    const { body } = req;
    const loginBody = ['email', 'password',];
    const bodyProperty = Object.keys(body);
    const isBodyValid =
        loginBody.filter((property) => !bodyProperty.includes(property))
            .length == 0 ? true : false;
    if (!isBodyValid) return responseHelprer.error(res, 400, "Invalid Body");
    next();
}

const editProfile = (req, res, next) => {
    const { body } = req;
    const editBody = ['name', 'display_name', 'email', 'password', 'image', 'gender_id', 'date_birth', 'address', 'phone_number'];
    const bodyProperty = Object.keys(body);
    const isBodyValid =
        editBody.filter((property) => !bodyProperty.includes(property))
            .length == 0 ? true : false;
    if (!isBodyValid) return responseHelprer.error(res, 400, "Invalid Body");
    next();
}

const vehicle = (req, res, next) => {
    const { body } = req;
    const editVehicle = ['name', 'locations', 'types_id', 'image', 'price', 'date_time'];
    const bodyProperty = Object.keys(body);
    const isBodyValid =
        editVehicle.filter((property) => !bodyProperty.includes(property))
            .length == 0 ? true : false;
    if (!isBodyValid) return responseHelprer.error(res, 400, "Invalid Body");
    next();

}

module.exports = {
    register,
    editProfile,
    vehicle,
    login
}