const db = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  sendPinForgotPass,
  sendPinVerifyRegister,
} = require("../helpers/sendPin");

const create = (body) => {
  return new Promise((resolve, reject) => {
    const { name, phone, email, password } = body;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const phonePattern =
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

    const checkEmail = `SELECT * FROM users WHERE email = ?`;

    db.query(checkEmail, [email], (err, result) => {
      if (err) return reject({ status: 500, err });
      if (email === "" || password === "")
        return reject({ status: 401, err: "Need input email, And password" });
      if (!emailPattern.test(email))
        return reject({ status: 401, err: "Format Email Invalid" });
      if (!phonePattern.test(phone) && phone !== "")
        return reject({ status: 401, err: "Format Number Phone Invalid" });
      if (!err && result.length > 0 && result[0].status === "pending")
        return reject({
          status: 400,
          err: "you have registered with this email address, check your email for verification",
        });
      if (result.length > 0)
        return reject({ status: 401, err: "Email is Already exist!" });

      const sqlQuery = `INSERT INTO users SET ?`;
      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          const pinCode = (length) => {
            const date = new Date();
            const createUnix = date + email;

            let result = "";
            let randomCode = createUnix;
            let randomCodeLength = randomCode.length;

            for (let i = 0; i < length; i++) {
              result += Math.floor(Math.random() * randomCodeLength);
            }
            return result;
          };

          const pin = pinCode(3);

          const bodyWithHashedPassword = {
            ...body,
            password: hashedPassword,
            active_year: new Date().getFullYear(),
            gender_id: 3,
            roles_id: 2,
            pin_verify: pin,
            status: "pending",
          };

          db.query(sqlQuery, [bodyWithHashedPassword], (err, result) => {
            if (err) return reject({ status: 500, err });

            sendPinVerifyRegister(name, email, pin);
            result = {
              msg: "Registration Success, Please check your email for verification",
              pin: pin,
            };
            resolve({ status: 200, result });
          });
        })
        .catch((err) => {
          reject({ status: 500, err });
        });
    });
  });
};

const createNewAdmin = (body) => {
  return new Promise((resolve, reject) => {
    const { phone, email, password } = body;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const phonePattern =
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

    const checkEmail = `SELECT * FROM users WHERE email = ?`;

    db.query(checkEmail, [email], (err, result) => {
      if (err) return reject({ status: 500, err });
      if (phone === "" || email === "" || password === "")
        return reject({
          status: 401,
          err: "Need input phone, email, And password",
        });
      if (!emailPattern.test(email))
        return reject({ status: 401, err: "Format Email Invalid" });
      if (!phonePattern.test(phone))
        return reject({ status: 401, err: "Format Number Phone Invalid" });
      if (result.length > 0)
        return reject({ status: 401, err: "Email is Already" });

      const sqlQuery = `INSERT INTO users SET ?`;
      bcrypt
        .hash(password, 10)
        .then((hashedPassword) => {
          const bodyWithHashedPassword = {
            ...body,
            password: hashedPassword,
            active_year: new Date().getFullYear(),
            gender_id: 3,
            roles_id: 1,
          };

          db.query(sqlQuery, [bodyWithHashedPassword], (err, result) => {
            if (err) return reject({ status: 500, err });
            result = { msg: "Registration Admin Is Successful" };
            resolve({ status: 200, result });
          });
        })
        .catch((err) => {
          reject({ status: 500, err });
        });
    });
  });
};

const verifyPinModel = (pin) => {
  return new Promise((resolve, reject) => {
    const checkPinQuery = `SELECT * FROM users WHERE pin_verify = ?`;
    db.query(checkPinQuery, pin, (err, result) => {
      if (err) return reject({ status: 500, err });
      if (result.length === 0) return reject({ status: 400, err: "Wrong Pin" });

      const sqlQuery =
        'UPDATE users SET pin_verify = NULL, status = "active" WHERE pin_verify = ?';
      db.query(sqlQuery, pin, (err, result) => {
        if (err) return reject({ status: 500, err });

        result = {
          msg: "your account has been successfully verified, please login again on the web or mobile application",
        };
        resolve({ status: 200, result });
      });
    });
  });
};

const signIn = (body) => {
  return new Promise((resolve, reject) => {
    const { email, password } = body;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    const sqlQuery = `SELECT * FROM users WHERE email = ?`;

    db.query(sqlQuery, [email], (err, result) => {
      if (err) return reject({ status: 500, err });
      if (!emailPattern.test(email))
        return reject({ status: 400, err: "Format Email Is Invalid" });
      if (result.length === 0)
        return reject({ status: 401, err: "Email/Password Is Wrong!" });

      const { status } = result[0];
      if (result.length > 0 && status === "pending")
        return reject({
          status: 400,
          err: "your account has not been verified, please check your email for verification",
        });

      bcrypt.compare(password, result[0].password, (err, isValid) => {
        if (err) return reject({ status: 500, err });
        if (!isValid)
          return reject({ status: 400, err: "Email/Password Is Wrong!" });

        const payload = {
          id: result[0].id,
          name: result[0].name,
          email: result[0].email,
          image: result[0].image,
          roles_id: result[0].roles_id,
        };
        const jwtOptions = {
          expiresIn: "24h",
          issuer: process.env.ISSUER,
        };
        jwt.sign(payload, process.env.SECRET_KEY, jwtOptions, (err, token) => {
          const { id } = result[0];
          if (err) reject({ status: 500, err });
          resolve({
            status: 200,
            result: { id, token, msg: "login successful" },
          });
        });
      });
    });
  });
};

const forgotPassModel = (email) => {
  return new Promise((resolve, reject) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    const checkEmail = "SELECT * FROM users WHERE email = ?";
    db.query(checkEmail, [email], (err, result) => {
      if (err) return reject({ status: 500, err });
      if (!emailPattern.test(email))
        return reject({ status: 400, err: "Format Email Is Invalid" });
      if (result.length === 0)
        return reject({ status: 401, err: "Email Not Found!" });

      const { name } = result[0];

      const pinCode = (length) => {
        const date = new Date();
        const createUnix = date + email;

        let result = "";
        let randomCode = createUnix;
        let randomCodeLength = randomCode.length;

        for (let i = 0; i < length; i++) {
          result += Math.floor(Math.random() * randomCodeLength);
        }
        return result;
      };

      const pin = pinCode(3);

      const inserPinQuery = `UPDATE users SET pin_reset_pass = ? WHERE email = ?`;

      db.query(inserPinQuery, [pin, email], (err, result) => {
        if (err) return reject({ status: 500, err });

        sendPinForgotPass(email, pin, name);
        result = {
          msg: "OTP are sending to your email, please check your email",
        };
        resolve({ status: 200, result });
      });
    });
  });
};

const resetPassModel = (pin, password) => {
  return new Promise((resolve, reject) => {
    const checkPin = `SELECT * FROM users WHERE pin_reset_pass = ? `;
    db.query(checkPin, [pin], (err, result) => {
      if (err) return reject({ status: 500, err });
      if (pin === "" || password === "")
        return reject({ status: 400, err: "All must be filled" });
      if (result.length === 0)
        return reject({ status: 400, err: "Your OTP is wrong!" });

      bcrypt.hash(password, 10).then((hashedPassword) => {
        const sqlQuery =
          "UPDATE users SET password = ?, pin_reset_pass = NULL WHERE pin_reset_pass = ?";
        db.query(sqlQuery, [hashedPassword, pin], (err) => {
          if (err) return reject({ status: 500, err });
          if (hashedPassword === "")
            return reject({ status: 400, err: "Must be filled" });

          const delPinQuery = `UPDATE users SET pin_reset_pass = 123 WHERE password = ?`;
          db.query(delPinQuery, [pin, hashedPassword], (err, result) => {
            if (err) return reject({ status: 500, err });

            result = { msg: "Success reset password" };
            resolve({ status: 200, result });
          });
        });
      });
    });
  });
};

const exit = (token) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `INSERT INTO blacklist_token (token) values (?)`;

    db.query(sqlQuery, [token], (err, result) => {
      if (err) return reject({ status: 500, err });

      result = { msg: "You have been Logged Out" };
      resolve({ status: 200, result });
    });
  });
};

module.exports = {
  create,
  createNewAdmin,
  verifyPinModel,
  signIn,
  forgotPassModel,
  resetPassModel,
  exit,
};
