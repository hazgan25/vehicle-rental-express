// const mysql = require('mysql')
const db = require('../database/db')
const bcrypt = require('bcrypt')

const userDataPersonal = (id) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `SELECT u.id, u.name, u.email, u.image,
        u.phone, u.active_year, g.name AS 'gender', u.address,
        u.dob, r.name AS 'role'
        FROM users u
        JOIN genders g ON u.gender_id = g.id
        JOIN roles r ON u.roles_id = r.id
        WHERE u.id = ?`;

        db.query(sqlQuery, id, (err, result) => {
            if (err) return reject({ status: 500, err });
            resolve({ status: 200, result });
        })
    })
}

const editUserData = (userInfo, body, file) => {
    return new Promise((resolve, reject) => {
        const { email } = body
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
        const checkEmail = `SELECT * FROM users WHERE email = ?`

        db.query(checkEmail, [email], (err, result) => {
            if (err) return reject({ status: 500, err })
            if (result.length > 0 && userInfo.email !== email) return reject({ status: 401, err: 'Email Is Already' })
            if (!emailPattern.test(email)) return reject({ status: 401, err: 'Format Email Invalid' })

            const sqlQuery = `UPDATE users SET ? WHERE id = ${userInfo.id}`
            if (file) body = { ...body, image: `${process.env.IMAGE_HOST}${file.filename}` }
            if (!file) body = { ...body }

            db.query(sqlQuery, [body], (err, result) => {
                if (err) return reject({ status: 500, err })
                result = { msg: 'Success Change Profile' }
                resolve({ status: 200, result })
            })
        })
    })
}

const editPasswordData = (id, body) => {
    return new Promise((resolve, reject) => {
        const { currentPass, newPass } = body
        const checkPass = `SELECT password FROM users WHERE id = ?`

        db.query(checkPass, [id], (err, result) => {
            if (err) return reject({ status: 500, err })

            bcrypt.compare(currentPass, result[0].password, (err, isValid) => {
                if (err) return reject({ status: 500, err })
                if (!isValid && currentPass !== '' && newPass !== '') return reject({ status: 401, err: 'Curent Password is wrong' })

                bcrypt.hash(newPass, 10)
                    .then((hashedPassword) => {
                        const sqlQuery = `UPDATE users SET password = ? WHERE id = ${id}`

                        db.query(sqlQuery, [hashedPassword], (err, result) => {
                            if (err) return reject({ status: 500, err })
                            if (currentPass === newPass && currentPass !== '') return reject({ status: 401, err: 'The password is already in use, try to find another one' })
                            if (currentPass == '' || newPass == '') return reject({ status: 401, err: 'Must be filled' })
                            result = { msg: 'Change Password is Success' }
                            resolve({ status: 200, result })
                        })
                    })
                    .catch((err) => {
                        reject({ status: 500, err })
                    })
            })
        })
    })
}

const deleteAccountUser = (id, token) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `DELETE FROM users WHERE id = ?`

        db.query(sqlQuery, id, (err, result) => {
            if (err) return reject({ status: 500, err })
            result = { msg: 'You have successfully deleted your account' }
            resolve({ status: 200, result })

            const blacklistToken = `INSERT INTO blacklist_token (token) value (?)`
            db.query(blacklistToken, [token], (err, result) => {
                if (err) return reject({ status: 500, err })
                result = { msg: 'You have successfully deleted your account' }
                resolve({ status: 200, result })
            })
        })
    })
}

module.exports = {
    userDataPersonal,
    editUserData,
    editPasswordData,
    deleteAccountUser
}