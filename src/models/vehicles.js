const mysql = require('mysql2')
const db = require('../database/db')
const fs = require('fs')

const addNewVehicleModel = (body, files, id) => {
    return new Promise((resolve, reject) => {
        const { locations_id, types_id } = body
        const checkLocation = `SELECT * FROM locations Where id = ?`

        db.query(checkLocation, [locations_id], (err, result) => {
            if (err) {
                deleteImages(files, reject)
                return reject(err)
            }
            if (result.length === 0) return resolve({ status: 400, result: { err: `You haven't created a location id yet` } })

            const checkType = `SELECT * FROM types WHERE id = ?`
            db.query(checkType, [types_id], (err, result) => {
                if (err) {
                    deleteImages(files, reject)
                    return reject(err)
                }

                if (result.length === 0) return resolve({ status: 400, result: { err: `Wrong Types` } })

                body = {
                    ...body,
                    user_id: id
                }

                if (files.length === 0) return resolve({ status: 400, result: { err: 'Please Add an Images' } })
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
        })

    })
}

const listVehicleModels = (query) => {
    return new Promise((resolve, reject) => {
        let sqlQuery = `SELECT v.id, v.name AS "vehicle", l.name,
        t.name AS "types", v.stock, v.rating, v.price, u.name AS "owner",
        (SELECT images FROM vehicles_img WHERE vehicle_id = v.id LIMIT 1) AS image,
        v.date_time AS 'date'
        FROM vehicles v
        JOIN types t ON v.types_id = t.id
        JOIN users u ON v.user_id = u.id 
        JOIN locations l ON v.locations_id = l.id
        `

        const statment = []

        let querySearch = ''
        let queryKeyword = ''
        let queryFilter = ''
        let queryLimit = ''
        let queryPage = ''
        let queryBy = ''
        let queryOrder = ''

        let keyword = ''
        if (query.search) {
            keyword = `%${query.search}%`
            sqlQuery += ` WHERE v.name LIKE "${keyword}" OR l.name LIKE '${keyword}' `
            querySearch = 'search'
        }

        let filter = ''
        if (query.type && !query.search && !query.location) {
            filter = `${query.type}`
            sqlQuery += ` WHERE t.id = "${filter}" `
            queryFilter = 'type'
        }
        if (query.type && query.search) {
            filter = `${query.type}`
            sqlQuery += ` AND t.id = "${filter}" `
            queryFilter = 'type'
        }
        if (query.location && !query.search && !query.type) {
            filter = `${query.location}`
            sqlQuery += ` WHERE l.id = "${filter}" `
            queryFilter = 'location'
        }
        if (query.location && query.search) {
            filter = `${query.location}`
            sqlQuery += ` AND l.id = "${filter}" `
            queryFilter = 'location'
        }

        const order = query.order;
        let orderBy = "";
        if (query.by && query.by.toLowerCase() == "vehicles") orderBy = "v.name"
        if (query.by && query.by.toLowerCase() == "type") orderBy = "t.name"
        if (query.by && query.by.toLowerCase() == "locations") orderBy = "l.name"
        if (query.by && query.by.toLowerCase() == "rating") orderBy = "v.rating"
        if (query.by && query.by.toLowerCase() == "id") orderBy = "v.id"
        if (order && orderBy) {
            sqlQuery += " ORDER BY ? ?";
            statment.push(mysql.raw(orderBy), mysql.raw(order))
            queryBy = 'by'
            queryOrder = 'order'
        }

        const page = parseInt(query.page)
        const limit = parseInt(query.limit)
        if (query.limit && !query.page) {
            queryLimit = 'limit'
            sqlQuery += ' LIMIT ? '
            statment.push(limit)
        }
        if (query.limit && query.page) {
            queryLimit = 'limit'
            queryPage = 'page'

            sqlQuery += ' LIMIT ? OFFSET ? '
            const offset = (page - 1) * limit
            statment.push(limit, offset)
        }

        let countQuery = ` SELECT COUNT(*) AS "count" FROM vehicles v
        JOIN types t ON v.types_id = t.id
        JOIN users u ON v.user_id = u.id
        JOIN locations l ON v.locations_id = l.id
        `

        if (query.search) {
            keyword = `%${query.search}%`
            countQuery += ` WHERE v.name LIKE "${keyword}" OR l.name LIKE "${keyword}" `
        }
        if (query.type && !query.search) {
            filter = `${query.type}`
            countQuery += ` WHERE t.id = '${filter}' `
        }
        if (query.type && query.search) {
            filter = `${query.type}`
            countQuery += ` AND t.id = '${filter}' `
        }

        db.query(countQuery, (err, result) => {
            if (err) return reject({ status: 500, err })

            const count = result[0].count
            const newCount = count - page

            let linkResult = ``;
            let links = `${process.env.URL_HOST}/vehicles?`
            let link1 = `${querySearch}=${queryKeyword}`
            let link2 = `${queryFilter}=${filter}`
            let link3 = `${queryBy}=${query.by}&${queryOrder}=${order}`

            if (query.type && query.location) link2 = `type=${query.type}&location=${query.location}`

            const bySearch = query.search
            const byFilter = query.type || query.location
            const byOrderBy = order && orderBy

            if (bySearch) linkResult = links + link1
            if (byFilter) linkResult = links + link2
            if (byOrderBy) linkResult = links + link3


            if (bySearch && byFilter) linkResult = `${links}${link1}&${link2}`
            if (bySearch && byOrderBy) linkResult = `${links}${link1}&${link3}`
            if (byFilter && byOrderBy) linkResult = `${links}${link2}&${link3}`

            if (bySearch && byFilter && byOrderBy) linkResult = `${links}${link1}&${link2}&${link3}`

            let linkNext = `${linkResult}&${queryLimit}=${limit}&${queryPage}=${page + 1}`
            let linkPrev = `${linkResult}&${queryLimit}=${limit}&${queryPage}=${page - 1}`

            let meta = {
                next: newCount <= 0 ? null : linkNext,
                prev: page == 1 || newCount < 0 ? null : linkPrev,
                limit: limit,
                page: page,
                totalPage: Math.ceil(count / limit),
                pageRemaining:
                    page == 1 && newCount < 0 ? null :
                        count < limit ? null :
                            newCount <= 0 ? null :
                                Math.ceil(newCount / limit),
                totalData: newCount < 0 ? null : count,
                totalRemainingData:
                    page == 1 && newCount < 0 ? null :
                        count < limit ? null :
                            newCount <= 0 ? null :
                                newCount
            }

            if (!query.page || !query.limit) {
                meta = {
                    next: null,
                    prev: null,
                    limit: null,
                    page: null,
                    totalData: newCount < 0 ? null : count
                }
            }

            db.query(sqlQuery, statment, (err, result) => {
                if (err) return reject({ status: 500, err })

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
            const sqlQuery = `SELECT v.id, v.name AS "vehicle", l.name,
            t.name AS "types", v.price, u.name AS "owner",  u.name AS "owner"
            FROM vehicles v
            JOIN types t ON v.types_id = t.id
            JOIN users u ON v.user_id = u.id
            JOIN locations l ON v.locations_id = l.id
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
        const { locations_id, types_id } = body

        const checkIdRenter = `SELECT * FROM vehicles WHERE id = ${body.id} AND user_id = ${id}`
        db.query(checkIdRenter, (err, result) => {
            if (err) {
                deleteImages(files, reject)
                return reject(err)
            }
            if (result.length === 0) return resolve({ status: 400, result: { err: `You are not the owner of this vehicle` } })

            const checkLocation = `SELECT * FROM locations WHERE id = ?`
            db.query(checkLocation, [locations_id], (err, result) => {
                if (err) {
                    deleteImages(files, reject)
                    return reject(err)
                }
                if (result.length === 0) return resolve({ status: 400, result: { err: `You haven't created a location id yet` } })

                const checkType = `SELECT * FROM types WHERE id = ?`
                db.query(checkType, [types_id], (err, result) => {
                    if (err) {
                        deleteImages(files, reject)
                        return reject(err)
                    }
                    if (result.length === 0) return resolve({ status: 400, result: { err: `Wrong Types` } })

                    const totalFiles = files.length

                    const sqlQuery = `UPDATE vehicles SET ? WHERE id = ${body.id} AND user_id = ${id}`
                    db.query(sqlQuery, body, (err, result) => {
                        if (err) {
                            if (files.length !== 0) {
                                deleteImages(files, reject)
                            }
                            return reject(err)
                        }

                        result = { msg: 'Update Success', data: body }
                        if (files.length === 0) {
                            return resolve({ status: 200, result })
                        }

                        const deleteFiles = `DELETE FROM vehicles_img WHERE vehicle_id = ? LIMIT ?`
                        db.query(deleteFiles, [body.id, totalFiles], (err) => {
                            if (err) {
                                if (files.length !== 0) {
                                    deleteImages(files, reject)
                                }
                                return reject(err)
                            }
                        })

                        let values = 'VALUES'
                        const imgArr = []
                        const picImg = []

                        files.forEach((data, idx) => {
                            if (idx !== files.length - 1) {
                                values += ` (?, ?), `
                            }
                            else {
                                values += ` (?, ?) `
                            }
                            imgArr.push(`${process.env.URL_HOST}/${data.filename}`, body.id)
                            picImg.push(`${process.env.URL_HOST}/${data.filename}`)
                        })

                        const imgQuery = `INSERT INTO vehicles_img (images, vehicle_id) ${values}`
                        db.query(imgQuery, imgArr, (err, result) => {
                            if (err) {
                                if (files.length !== 0) {
                                    deleteImages(files, reject)
                                }
                            }
                            result = { msg: 'Update is Success With Image', data: body, picImg }
                            resolve({ status: 200, result })

                        })
                    })
                })
            })
        })
    })
}

const delVehicleById = (idVehicle, id) => {
    return new Promise((resolve, reject) => {

        const checkId = `SELECT * FROM vehicles WHERE id = ${idVehicle} AND user_id = ${id}`
        db.query(checkId, (err, result) => {
            if (err) return reject({ status: 500, err })
            if (result.length === 0) return reject({ status: 401, err: "You are not the owner of this vehicle" })

            const sqlQuery = `DELETE FROM vehicles WHERE id = ${idVehicle} AND user_id = ${id}`
            db.query(sqlQuery, (err, result) => {
                if (err) return reject({ status: 500, err })
                resolve({ status: 200, result })
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