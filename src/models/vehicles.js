const mysql = require('mysql');
const db = require('../database/db');

const postNewVehicle = (body, files, id) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `INSERT INTO vehicles SET ?`;
        if (files) {
            const filesArr = []
            for (let i = 0; i < files.length; i++) {
                filesArr.push(`${process.env.URL_HOST}/${files[i].filename}`)
            }
            let imgVahehicle = JSON.stringify(filesArr)
            body = {
                ...body,
                images: imgVahehicle,
                user_id: id
            }

        } else {
            body = { ...body, user_id: id }
        }
        db.query(sqlQuery, body, (err, result) => {
            if (err) return reject({ status: 500, err })
            resolve({ status: 200, result })
        })
    })
}

const getVehicle = (query) => {
    return new Promise((resolve, reject) => {
        let sqlQuery = `SELECT v.id, v.name AS "vehicle", v.locations,
        t.name AS "types", v.images, v.price, u.name AS "owner"
        FROM vehicles v
        JOIN types t ON v.types_id = t.id
        JOIN users u ON v.user_id = u.id`;
        const statment = [];

        // searching
        let keyword = "%%";
        if (query.name) keyword = `%${query.name}%`, sqlQuery += ` WHERE v.name LIKE "${keyword}"`;

        // filter
        let filter = '';
        if (query.location) filter = `${query.location}`, sqlQuery += ` AND  v.locations = "${filter}"`;
        if (query.type) filter = `${query.type}`, sqlQuery += ` AND t.id = "${filter}"`;

        // filter
        // order by
        const order = query.order;
        let orderBy = "";
        if (query.by && query.by.toLowerCase() == "vehicles") orderBy = "v.name";
        if (query.by && query.by.toLowerCase() == "type") orderBy = "t.name";
        if (query.by && query.by.toLowerCase() == "locations") orderBy = "v.locationse";
        if (query.by && query.by.toLowerCase() == "id") orderBy = "v.id";
        if (order && orderBy) {
            sqlQuery += " ORDER BY ? ?";
            statment.push(mysql.raw(orderBy), mysql.raw(order));
        }
        db.query(sqlQuery, statment, (err, result) => {
            if (err) return reject({ status: 500, err });
            resolve({ status: 200, result });
        })
    })
}

// update vehicles PUT
const updateVehicles = (body, id, files) => {
    return new Promise((resolve, reject) => {
        const checkId = `SELECT * FROM vehicles WHERE id = ${body.id} AND user_id = ${id}`;
        db.query(checkId, (err, result) => {
            if (err) return reject({ status: 500, err });
            if (result.length === 0) return reject({ status: 401, err: "Anda Bukan Pemilik Kendaraan Ini" });

            const sqlQuery = `UPDATE vehicles SET ? WHERE id = ${body.id} AND user_id = ${id}`;
            if (files) {
                const filesArr = []
                for (let i = 0; i < files.length; i++) {
                    filesArr.push(`${process.env.URL_HOST}/${files[i].filename}`)
                }
                let imgVahehicle = JSON.stringify(filesArr)
                body = {
                    ...body,
                    images: imgVahehicle,
                }

            } else {
                body = { ...body }
            }

            db.query(sqlQuery, body, (err, result) => {
                if (err) return reject({ status: 500, err });
                result = {
                    ...result,
                    body
                }
                resolve({ status: 200, result });
            })
        })
    })
}

const delVehicleById = (idVehicle, id) => {
    return new Promise((resolve, reject) => {

        const checkId = `SELECT * FROM vehicles WHERE id = ${idVehicle} AND user_id = ${id}`;
        db.query(checkId, (err, result) => {
            if (err) return reject({ status: 500, err });
            if (result.length === 0) return reject({ status: 401, err: "Anda Bukan Pemilik Kendaraan Ini" });
            // console.log(result.length);

            // console.log(id)
            const sqlQuery = `DELETE FROM vehicles WHERE id = ${idVehicle} AND user_id = ${id}`;
            db.query(sqlQuery, (err, result) => {
                if (err) return reject({ status: 500, err });
                resolve({ status: 200, result });
            })
        })
    })
}

module.exports = {
    postNewVehicle,
    getVehicle,
    updateVehicles,
    delVehicleById
};