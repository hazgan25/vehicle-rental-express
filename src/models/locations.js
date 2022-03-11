const db = require('../database/db')

const addNewLocationModel = (body, id) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `INSERT INTO locations SET ?`
        body = {
            ...body,
            user_id: id
        }
        db.query(sqlQuery, body, (err, result) => {
            if (err) return reject({ status: 500, err })
            resolve({ status: 200, result })
        })
    })
}

const listLocationByRenterModel = (id) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `SELECT * FROM locations WHERE user_id = ?`
        db.query(sqlQuery, id, (err, result) => {
            if (err) return reject({ status: 500, err })
            resolve({ status: 200, result })
        })
    })
}

const editNameLocationModel = (body, id) => {
    return new Promise((resolve, reject) => {
        const checkIdLocation = `SELECT * FROM locations WHERE id = ${body.id} AND user_id = ${id}`
        db.query(checkIdLocation, (err, result) => {
            if (err) return reject({ status: 500, err })
            if (result.length === 0) return resolve({ status: 401, result: { err: "You don't have a location here yet" } })

            const sqlQuery = `UPDATE locations SET ? WHERE id = ${body.id} AND user_id = ${id}`
            db.query(sqlQuery, (err, result) => {
                if (err) return reject({ status: 500, err })
                resolve({ status: 200, result })
            })
        })
    })
}

module.exports = {
    addNewLocationModel,
    listLocationByRenterModel,
    editNameLocationModel
}