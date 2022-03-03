const mysql = require('mysql');
const db = require('../database/db');
const fs = require('fs')

const addNewVehicleModel = (body, files, id) => {
    return new Promise((resolve, reject) => {
        body = {
            ...body,
            user_id: id
        }
        const sqlQuery = `INSERT INTO vehicles SET ?`
        db.query(sqlQuery, body, (err, result) => {
            if (err) {
                deleteImages(files, reject)
                return reject(err)
            }

            const idVehicle = result.insertId
            let values = 'VALUES'
            const imgArr = []

            files.forEach((data, idx) => {
                if (idx !== files.length - 1) {
                    values += ` (?, ?), `
                }
                else {
                    values += ` (?, ?) `
                }
                imgArr.push(`${process.env.URL_HOST}/${data.filename}`, idVehicle)
            })

            const imgQuery = `INSERT INTO vehicles_img (images, vehicle_id) ${values}`
            db.query(imgQuery, imgArr, (err, result) => {
                if (err) {
                    deleteImages(files, reject)
                    return reject(err)
                }
                resolve({ status: 200, result })
            })
        })
    })
}

const listVehicleModels = (query) => {
    return new Promise((resolve, reject) => {
        let sqlQuery = `SELECT v.id, v.name AS "vehicle", v.locations,
        t.name AS "types", v.price, u.name AS "owner",
        (SELECT images FROM vehicles_img WHERE vehicle_id = v.id LIMIT 1) as image
        FROM vehicles v
        JOIN types t ON v.types_id = t.id
        JOIN users u ON v.user_id = u.id`;
        const statment = [];

        let querySearch = ''
        let queryKeyword = ''
        let queryFilter = ''
        let queryLimit = ''
        let queryPage = ''
        let queryBy = ''
        let queryOrder = ''

        // searching
        let keyword = "%%"
        if (query.name) {
            keyword = `%${query.name}%`
            sqlQuery += ` WHERE v.name LIKE "${keyword}"`
            querySearch = 'name'
        }
        if (query.location) {
            keyword = `%${query.location}%`
            sqlQuery += ` WHERE v.location LIKE "${keyword}"`
            querySearch = 'name'
        }

        // filter
        let filter = ''
        if (query.type) {
            filter = `${query.type}`
            sqlQuery += ` AND t.id = "${filter}"`
            queryFilter = 'filter'
        }

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

        // limit offset
        const page = parseInt(query.page.join(''))
        const limit = parseInt(query.limit)
        if (query.limit) {
            queryLimit = 'limit'
            sqlQuery += ' LIMIT ? '
            statment.push(limit)
        }
        if (query.limit && query.page) {
            queryLimit = 'limit'
            queryPage = 'page'

            sqlQuery += ' OFFSET ? '
            const offset = (page - 1) * limit
            statment.push(limit, offset)
        }

        const countQuery = `SELECT COUNT(*) AS 'count' FROM vehicles`
        db.query(countQuery, (err, result) => {
            if (err) return reject({ status: 500, err })

            // variabel hasil count/hitung keseluruhan vehicles
            const count = result[0].count
            const newCount = count - page

            // link paginasi
            let linkResult = ``;
            let links = `${process.env.URL_HOST}/vehicles?`
            let link1 = `${querySearch}=${queryKeyword}`
            let link2 = `${queryFilter}=${filter}`
            let link3 = `${queryBy}=${query.by}&${queryOrder}=${order}`

            // pernyataan key
            const bySearch = query.name || query.email
            const byFilter = query.gender || query.role
            const byOrderBy = order && orderBy

            // jika Hanya Salah Satu key
            if (bySearch) linkResult = links + link1
            if (byFilter) linkResult = links + link2
            if (byOrderBy) linkResult = links + link3
            // jika ada dua key
            if (bySearch && byFilter) linkResult = `${links}${link1}&${link2}`
            if (bySearch && byOrderBy) linkResult = `${links}${link1}&${link3}`
            if (byFilter && byOrderBy) linkResult = `${links}${link2}&${link3}`
            // jika ada tiga key
            if (bySearch && byFilter && byOrderBy) linkResult = `${links}${link1}&${link2}&${link3}`

            let linkNext = `${linkResult}&${queryLimit}=${limit}&${queryPage}=${page + 1}`
            let linkPrev = `${linkResult}&${queryLimit}=${limit}&${queryPage}=${page - 1}`

            let meta = {
                next: newCount <= 0 ? null : linkNext,
                prev: page == 1 || newCount < 0 ? null : linkPrev,
                total: newCount < 0 ? null : newCount
            }

            if (query.page == undefined || query.limit == undefined) {
                meta = null
            }

            db.query(sqlQuery, statment, (err, result) => {
                if (err) return reject({ status: 500, err })
                if (meta.next === null && meta.prev === null) result = { data: 'is empty try again' }
                resolve({ status: 200, result: { data: result, meta } })
            })
        })

    })
}

const vehicleDetailModel = (id) => {
    return new Promise((resolve, reject) => {
        const imgQuery = `SELECT images from vehicles_img WHERE vehicle_id = ?`
        db.query(imgQuery, [id], (err, result) => {
            if (err) return reject({ status: 500, err })

            const images = []
            result.forEach((data) => {
                images.push(data)
            })
            const sqlQuery = `SELECT v.id, v.name AS "vehicle", v.locations,
            t.name AS "types", v.price, u.name AS "owner",  u.name AS "owner"
            FROM vehicles v
            JOIN types t ON v.types_id = t.id
            JOIN users u ON v.user_id = u.id
            WHERE v.id = ?`

            db.query(sqlQuery, [id], (err, result) => {
                if (err) return reject({ status: 500, err })

                result = { ...result[0], ...{ images } }
                resolve({ status: 200, result })
            })
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

const deleteImages = (files, reject) => {
    files.forEach((element) => {
        fs.unlink(`media/${element}`, (err) => {
            if (err) {
                return reject(err);
            }
        })
    })
}

module.exports = {
    addNewVehicleModel,
    listVehicleModels,
    vehicleDetailModel,
    updateVehicles,
    delVehicleById
};