const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../database/db')

const createNewUser = (body) => {
    return new Promise((resolve, reject) => {
        const { email, password, name } = body
        const checkEmail = `SELECT * FROM users WHERE email = ?`

        db.query(checkEmail, [email], (err, result) => {
            if (err) return reject({ status: 500, err })

            if (email === '' || name === '' || password === '') return reject({ status: 401, err: "Need Name/email/Password" })
            if (!email.includes('@gmail.com') && !email.includes('@yahoo.com') && !email.includes('@mail.com')) return reject({ status: 401, err: "Invalid Email" }) //salah satu jika mail tidak sesuai
            if (result.length > 0) return reject({ status: 401, err: "Email is Already" })

            const sqlQuery = `INSERT INTO users SET ?`

            bcrypt
                .hash(password, 10)
                .then((hashedPassword) => {
                    const bodyWithHashedPassword = {
                        ...body,
                        roles_id: 2, //auto role users
                        password: hashedPassword,
                    }
                    db.query(sqlQuery, [bodyWithHashedPassword], (err, result) => {
                        if (err) reject({ status: 500, err });
                        resolve({ status: 201, result });
                    })
                })
                .catch((err) => {
                    reject({ status: 500, err })
                })

        })
    })
}

const createNewAdmin = (body) => {
    return new Promise((resolve, reject) => {
        const { email, name, password } = body;
        const checkEmail = `SELECT * FROM users WHERE email = ?`

        db.query(checkEmail, [email], (err, result) => {
            if (err) return reject({ status: 500, err });
            if (email === '' || name === '' || password === '') return reject({ status: 401, err: "Need Name/email/Password" });
            if (!email.includes('@gmail.com') && !email.includes('@yahoo.com') && !email.includes('@mail.com')) return reject({ status: 401, err: "Invalid Email" });
            if (result.length > 0) return reject({ status: 401, err: "Email is Already" });

            const sqlQuery = `INSERT INTO users SET ?`
            bcrypt
                .hash(body.password, 10)
                .then((hashedPassword) => {
                    const bodyWithHashedPassword = {
                        ...body,
                        roles_id: 1, //auto role admin
                        password: hashedPassword,
                    }
                    db.query(sqlQuery, [bodyWithHashedPassword], (err, result) => {
                        if (err) reject({ status: 500, err })
                        resolve({ status: 201, result })
                    })
                })
                .catch((err) => {
                    reject({ status: 500, err })
                })
        })
    })
}


const signIn = (body) => {
    return new Promise((resolve, reject) => {
        const { email, password } = body;
        const sqlQuery = `SELECT * FROM users WHERE ?`
        db.query(sqlQuery, { email }, (err, result) => {
            if (err) return reject(({ status: 500, err }))
            if (result.length == 0) return reject({ status: 401, err: "Email/Password Salah" })

            bcrypt.compare(password, result[0].password, (err, isValid) => {
                if (err) return reject({ status: 500, err });
                if (!isValid) return reject({ status: 401, err: "Email/Password Salah" })
                const payload = {
                    id: result[0].id,
                    name: result[0].name,
                    email: result[0].email,
                    image: result[0].image,
                    roles_id: result[0].roles_id
                }
                const jwtOptions = {
                    expiresIn: "20m",
                    issuer: process.env.ISSUER
                }
                jwt.sign(payload, process.env.SECRET_KEY, jwtOptions, (err, token) => {
                    const { name, image, roles_id } = result[0]
                    if (err) reject({ status: 500, err })
                    resolve({
                        status: 200, result: {
                            name,
                            email,
                            image,
                            roles_id,
                            token
                        }
                    })
                })
            })
        })
    })
}


module.exports = {
    createNewUser,
    createNewAdmin,
    signIn,
}