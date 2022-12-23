// const mysql = require('mysql')
const db = require("../database/db");
const bcrypt = require("bcrypt");
const fs = require("fs");

const userDataPersonal = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `SELECT u.id, u.name, u.email, u.image,
        u.phone, u.active_year, g.name AS 'gender', u.address,
        DATE_FORMAT(u.dob,'%Y-%m-%d') AS 'dob', r.name AS 'role'
        FROM users u
        JOIN genders g ON u.gender_id = g.id
        JOIN roles r ON u.roles_id = r.id
        WHERE u.id = ? `;

    db.query(sqlQuery, id, (err, result) => {
      if (err) return reject({ status: 500, err });
      resolve({ status: 200, result });
    });
  });
};

const editUserData = (userInfo, body, file) => {
  return new Promise((resolve, reject) => {
    const { email, dob, phone } = body;
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const phonePattern =
      /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

    const checkEmail = `SELECT * FROM users WHERE email = ?`;

    db.query(checkEmail, [email], (err, result) => {
      if (err) return reject({ status: 500, err });
      if (result.length > 0 && userInfo.email !== email)
        return reject({ status: 401, err: "Email Is Already" });
      if (email !== "" && !emailPattern.test(email))
        return reject({ status: 401, err: "Format Email Invalid" });
      if (phone !== "" && !phonePattern.test(phone))
        return reject({ status: 401, err: "Format Number Phone Invalid" });
      if (dob !== undefined && dob !== "" && !datePattern.test(dob))
        return reject({ status: 401, err: "Format Date Invalid" });

      const timeStamp = new Date();

      if (result[0].image) {
        fs.unlink(`public/img/users/${result[0].image}`, (err) => {
          console.log(err);
        });
      }

      const sqlQuery = `UPDATE users SET ? WHERE id = ${userInfo.id}`;
      if (file) body = { ...body, image: file.filename, update_at: timeStamp };
      if (!file) body = { ...body, update_at: timeStamp };

      if (dob === "") body = { ...body, dob: null, update_at: timeStamp };

      db.query(sqlQuery, [body], (err, result) => {
        if (err) return reject({ status: 500, err });
        result = { msg: "Success Change Profile" };
        resolve({ status: 200, result });
      });
    });
  });
};

const editPasswordData = (id, body) => {
  return new Promise((resolve, reject) => {
    const { currentPass, newPass } = body;
    const checkPass = `SELECT password FROM users WHERE id = ?`;

    db.query(checkPass, [id], (err, result) => {
      if (err) return reject({ status: 500, err });

      bcrypt.compare(currentPass, result[0].password, (err, isValid) => {
        if (err) return reject({ status: 500, err });
        if (!isValid && currentPass !== "" && newPass !== "")
          return reject({ status: 401, err: "Current Password is wrong" });

        bcrypt
          .hash(newPass, 10)
          .then((hashedPassword) => {
            const sqlQuery = `UPDATE users SET password = ? WHERE id = ${id}`;

            db.query(sqlQuery, [hashedPassword], (err, result) => {
              if (err) return reject({ status: 500, err });
              if (currentPass === newPass && currentPass !== "")
                return reject({
                  status: 401,
                  err: "The password is already in use, try to find another one",
                });
              if (currentPass == "" && newPass == "")
                return reject({ status: 401, err: "Must be filled" });
              if (currentPass == "")
                return reject({
                  status: 401,
                  err: "Current Password is Empty",
                });
              if (newPass == "")
                return reject({ status: 401, err: "New Password is Empty" });

              result = { msg: "Change Password is Success" };
              resolve({ status: 200, result });
            });
          })
          .catch((err) => {
            reject({ status: 500, err });
          });
      });
    });
  });
};

const upgradeUsertoRenter = (id) => {
  return new Promise((resolve, reject) => {
    const sqlQuery = `UPDATE users SET roles_id = 3 WHERE id = ?`;

    db.query(sqlQuery, [id], (err, result) => {
      if (err) return reject({ status: 500, err });

      result = { msg: "success upgrade account to renter" };
      resolve({ status: 200, result });
    });
  });
};

const deleteAccountUser = (id, token) => {
  return new Promise((resolve, reject) => {
    const deleteImgVehicleQuery = `DELETE FROM vehicles_img WHERE user_id = ?`;
    db.query(deleteImgVehicleQuery, id, (err) => {
      if (err) return reject({ status: 500, err });

      const deleteHistoryQuery = `DELETE FROM historys WHERE users_id = ${id} OR owner_id = ${id}`;
      db.query(deleteHistoryQuery, (err) => {
        if (err) return reject({ status: 500, err });

        const deleteLocationQuery = "DELETE FROM locations WHERE user_id = ?";
        db.query(deleteLocationQuery, id, (err) => {
          if (err) return reject({ status: 500, err });

          const deleteUserQuery = `DELETE FROM users WHERE id = ?`;
          db.query(deleteUserQuery, id, (err) => {
            if (err) return reject({ status: 500, err });

            const deleteVehicleQuery = `DELETE FROM vehicles WHERE user_id = ?`;
            db.query(deleteVehicleQuery, id, (err) => {
              if (err) return reject({ status: 500, err });

              const blackListTokenQuery = `INSERT INTO blacklist_token (token) value (?)`;
              db.query(blackListTokenQuery, [token], (err, result) => {
                if (err) return reject({ status: 500, err });

                result = { msg: "You have successfully deleted your account" };
                resolve({ status: 200, result });
              });
            });
          });
        });
      });
    });
  });
};

module.exports = {
  userDataPersonal,
  editUserData,
  editPasswordData,
  upgradeUsertoRenter,
  deleteAccountUser,
};
