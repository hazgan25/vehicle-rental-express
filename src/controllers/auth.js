const authModel = require("../models/auth");
const responseHelprer = require("../helpers/sendResponse");

// buat akun khusus user
const register = (req, res) => {
  const { body } = req;
  authModel
    .create(body)
    .then(({ status, result }) => {
      responseHelprer.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelprer.error(res, status, err);
    });
};

// buat akun khusus admin
const registerAdmin = (req, res) => {
  const { body } = req;
  authModel
    .createNewAdmin(body)
    .then(({ status, result }) => {
      responseHelprer.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelprer.error(res, status, err);
    });
};

const verifyPin = (req, res) => {
  const { pin } = req.params;
  authModel
    .verifyPinModel(pin)
    .then(({ status, result }) => {
      responseHelprer.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelprer.error(res, status, err);
    });
};

const login = (req, res) => {
  const { body } = req;
  authModel
    .signIn(body)
    .then(({ status, result }) => {
      responseHelprer.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelprer.error(res, status, err);
    });
};

const forgotPass = (req, res) => {
  const { email } = req.body;
  authModel
    .forgotPassModel(email)
    .then(({ status, result }) => {
      responseHelprer.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelprer.error(res, status, err);
    });
};

const resetPass = (req, res) => {
  const { pin, password } = req.body;
  authModel
    .resetPassModel(pin, password)
    .then(({ status, result }) => {
      responseHelprer.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelprer.error(res, status, err);
    });
};

const logout = (req, res) => {
  const token = req.header("x-access-token");
  const { id } = req.userInfo;
  authModel
    .exit(token, id)
    .then(({ status, result }) => {
      responseHelprer.success(res, status, result);
    })
    .catch(({ status, err }) => {
      responseHelprer.error(res, status, err);
    });
};

module.exports = {
  register,
  registerAdmin,
  verifyPin,
  login,
  forgotPass,
  resetPass,
  logout,
};
