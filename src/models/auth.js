const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../database/db')

const create = (body) => {
    return new Promise((resolve, reject) => {
        const { name, email, password } = body
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
        const checkEmail = `SELECT * FROM users WHERE email = ?`

        db.query(checkEmail, [email], (err, result) => {
            if (err) return reject({ status: 500, err })
            if (name === '' || email === '' || password === '') return reject({ status: 401, err: 'Need input name, email, And password' })
            if (!emailPattern.test(email)) return reject({ status: 401, err: 'Format Email Invalid' })
            if (result.length > 0) return reject({ status: 401, err: "Email is Already" })

            console.log(emailPattern.test(email))

            const sqlQuery = `INSERT INTO users SET ?`
            bcrypt
                .hash(password, 10)
                .then((hashedPassword) => {
                    const bodyWithHashedPassword = {
                        ...body,
                        password: hashedPassword,
                        active_year: new Date().getFullYear(),
                        roles_id: 2
                    }

                    db.query(sqlQuery, [bodyWithHashedPassword], (err, result) => {
                        if (err) return reject({ status: 500, err })
                        result = { msg: 'Registration Is Successful' }
                        resolve({ status: 200, result })
                    })
                })
                .catch((err) => { reject({ status: 500, err }) })
        })
    })
}

const createNewAdmin = (body) => {
    return new Promise((resolve, reject) => {
        const { name, email, password } = body
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
        const checkEmail = `SELECT * FROM users WHERE email = ?`

        db.query(checkEmail, [email], (err, result) => {
            if (err) return reject({ status: 500, err })
            if (name === '' || email === '' || password === '') return reject({ status: 401, err: 'Need input name, email, And password' })
            if (!emailPattern.test(email)) return reject({ status: 401, err: 'Format Email Invalid' })
            if (result.length > 0) return reject({ status: 401, err: "Email is Already" })

            console.log(emailPattern.test(email))

            const sqlQuery = `INSERT INTO users SET ?`
            bcrypt
                .hash(password, 10)
                .then((hashedPassword) => {
                    const bodyWithHashedPassword = {
                        ...body,
                        password: hashedPassword,
                        active_year: new Date().getFullYear(),
                        roles_id: 1
                    }

                    db.query(sqlQuery, [bodyWithHashedPassword], (err, result) => {
                        if (err) return reject({ status: 500, err })
                        result = { msg: 'Registration Admin Is Successful' }
                        resolve({ status: 200, result })
                    })
                })
                .catch((err) => { reject({ status: 500, err }) })
        })
    })
}


const signIn = (body) => {
    return new Promise((resolve, reject) => {
        const { email, password } = body
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
        const sqlQuery = `SELECT * FROM users WHERE ?`

        db.query(sqlQuery, { email }, (err, result) => {
            if (err) return reject(({ status: 500, err }))
            if (email === '' || password === '') return reject({ status: 401, err: 'Need input email And password' })
            if (!emailPattern.test(email)) return reject({ status: 401, err: 'Format Email Invalid' })

            bcrypt.compare(password, result[0].password, (err, isValid) => {
                if (err) return reject({ status: 500, err });
                if (!isValid) return reject({ status: 401, err: "Email/Password Is Wrong!" })

                const payload = {
                    id: result[0].id,
                    name: result[0].name,
                    email: result[0].email,
                    image: result[0].image,
                    roles_id: result[0].roles_id
                }
                const jwtOptions = { expiresIn: '10h', issuer: process.env.ISSUER }

                jwt.sign(payload, process.env.SECRET_KEY, jwtOptions, (err, token) => {
                    const { name, image, roles_id } = payload
                    if (err) reject({ status: 500, err })
                    resolve({ status: 200, result: { name, email, image, roles_id, token } })
                })
            })
        })
    })
}

const exit = (token) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `INSERT INTO blacklist_token (token) values (?)`

        db.query(sqlQuery, [token], (err, result) => {
            if (err) return reject({ status: 500, err })

            result = { msg: 'You have been Logged Out' }
            resolve({ status: 200, result })
        })
    })
}

module.exports = {
    create,
    createNewAdmin,
    signIn,
    exit
}