const moment = require('moment')
const mysql = require('mysql')
const db = require('../database/db')

// menambahkan data pembeli baru
const postNewHistory = (body, id, params) => {
    return new Promise((resolve, reject) => {
        const { date, quantity } = body
        const vehicleQuery = `SELECT stock, user_id, price FROM vehicles Where id  = ?`
        db.query(vehicleQuery, [params.id], (err, result) => {
            const { stock, user_id, price } = result[0]
            if (err) return reject({ status: 500, err })
            if (id === user_id) return resolve({ status: 400, result: { err: 'You are the owner of this vehicle' } })
            if (result.length === 0) return resolve({ status: 400, result: { err: 'vehicle not found' } })
            if (quantity === '') return resolve({ status: 400, result: { err: 'You Must Input quality' } })
            if (!err && stock === 0) return reject({ status: 400, err: 'out of stock' })

            body = {
                ...body,
                vehicles_id: params.id,
                users_id: id,
                payment: price * date * quantity,
                status_id: 2
            }
            const totalStock = stock - quantity

            const updateStock = `Update vehicles SET stock = ? WHERE id = ?`
            db.query(updateStock, [totalStock, params.id], (err) => {
                if (err) return reject({ status: 500, err })

                const sqlQuery = 'INSERT INTO historys SET ?'
                db.query(sqlQuery, body, (err, result) => {
                    if (err) return reject({ status: 500, err })

                    resolve({ status: 200, result })
                })
            })
        })
    })
}

const getHistory = (id, query) => {
    return new Promise((resolve, reject) => {
        let sqlQuery = `SELECT h.id, v.name, t.name AS "type", h.payment, h.quantity, s.name AS "status",
        (SELECT images FROM vehicles_img WHERE vehicle_id = v.id LIMIT 1) AS image,
        h.create_at, h.update_at,
        (SELECT h.create_at WHERE users_id = ${id} LIMIT 1) AS "renter_time"
        FROM historys h
        JOIN vehicles v ON h.vehicles_id = v.id
        JOIN types t ON v.types_id = t.id
        JOIN status s ON h.status_id = s.id
        WHERE h.users_id = ${id} `

        let querySearch = ''
        let queryKeyword = ''
        let queryFilter = ''
        let queryLimit = ''
        let queryPage = ''
        let queryBy = ''
        let queryOrder = ''

        const statment = []

        let keyword = ''
        if (query.search) {
            keyword = `%${query.search}%`
            sqlQuery += ` AND v.name LIKE "${keyword}" `
            querySearch = 'search'
            queryKeyword = `${query.search}`
        }

        let filter = ''
        if (query.filter) {
            if (query.filter && query.filter.toLowerCase() === 'week') {
                filter = `${query.filter}`
                sqlQuery += ` AND create_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) `
            }
            if (query.filter && query.filter.toLowerCase() === 'month') {
                filter = `${query.filter}`
                sqlQuery += ` AND create_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) `
            }
            if (query.filter && query.filter.toLowerCase() === 'year') {
                filter = `${query.filter}`
                sqlQuery += ` AND create_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR) `
            }
            queryFilter = 'filter'
        }

        const order = query.order
        let orderBy = ''
        if (query.by && query.by.toLowerCase() === 'types') orderBy = 't.name'
        if (query.by && query.by.toLowerCase() === 'data added') orderBy = 'h.create_at'
        if (query.by && query.by.toLowerCase() === 'vehicles') orderBy = 'v.name'
        if (order && orderBy) {
            sqlQuery += ' ORDER BY ? ? '
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

        let countQuery = `SELECT COUNT(*) as "count" FROM historys h
            JOIN vehicles v ON h.vehicles_id = v.id
            JOIN types t ON v.types_id = t.id
            JOIN status s ON h.status_id = s.id
            WHERE users_id = ${id}
        `

        if (query.search) {
            keyword = `%${query.search}%`
            countQuery += ` AND v.name LIKE "${keyword}" `
        }
        if (query.filter) {
            if (query.filter && query.filter.toLowerCase() === 'week') {
                filter = `${query.filter}`
                countQuery += ` AND create_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) `
            }
            if (query.filter && query.filter.toLowerCase() === 'month') {
                filter = `${query.filter}`
                countQuery += ` AND create_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) `
            }
            if (query.filter && query.filter.toLowerCase() === 'year') {
                filter = `${query.filter}`
                countQuery += ` AND create_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR) `
            }
        }

        db.query(countQuery, (err, result) => {
            if (err) return reject({ status: 500, err })

            const count = result[0].count
            const newCount = count - page

            let linkResult = ''
            let links = `${process.env.URL_HOST}/history?`
            let link1 = `${querySearch}=${queryKeyword}`
            let link2 = `${queryFilter}=${filter}`
            let link3 = `${queryBy}=${query.by}&${queryOrder}=${query.order}`

            const bySearch = query.search
            const byFilter = query.filter
            const byOrderBy = order && orderBy

            if (bySearch) linkResult = links + link1
            if (byFilter) linkResult = links + link2
            if (byOrderBy) linkResult = links + link3

            if (bySearch && byFilter) linkResult = `${links}${link1}&${link2}`
            if (byFilter && byOrderBy) linkResult = `${links}${link2}&${link3}`
            if (bySearch && byOrderBy) linkResult = `${links}${link1}&${link3}`

            if (bySearch && byFilter && byOrderBy) linkResult = `${links}${link1}&${link2}&${link3}`

            let linkNext = `${linkResult}&${queryLimit}=${limit}&${queryPage}=${page + 1}`
            let linkPrev = `${linkResult}&${queryLimit}=${limit}&${queryPage}=${page - 1}`

            let meta = {
                next: newCount <= 0 ? null : linkNext,
                prev: page === 1 || newCount < 0 ? null : linkPrev,
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

                let dataDays = []
                result.forEach((data) => {
                    result = {
                        id: data.id,
                        name: data.name,
                        type: data.type,
                        payment: data.payment,
                        quantity: data.quantity,
                        status: data.status,
                        image: data.image,
                        create_at: data.create_at,
                        update_at: data.update_at,
                        renter_time: moment(data.renter_time, 'YYYMMDD').fromNow()
                        // renter_time: 
                    }
                    dataDays.push(result)
                })

                resolve({ status: 200, result: { data: dataDays, meta } })
            })

        })
    })
}

const patchHistoryByIdModel = (body, historyID, userId) => {
    return new Promise((resolve, reject) => {
        const checkStatus = `SELECT * FROM historys WHERE id = ${historyID} AND users_id = ${userId}`

        db.query(checkStatus, (err, result) => {
            if (err) return reject({ status: 500, err })
            if (result.length === 0) return reject({ status: 400, err: 'no your history data here' })
            const { status_id, quantity, vehicles_id } = result[0]
            const timeStamp = new Date()

            if (status_id === 2) body = { ...body, status_id: 1, update_at: timeStamp }
            if (status_id === 1) body = { ...body, update_at: timeStamp }


            const sqlQuery = `UPDATE historys SET ? WHERE id = ${historyID} AND users_id = ${userId}`
            db.query(sqlQuery, [body], (err) => {
                if (err) return reject({ status: 500, err })

                const checkStockQuery = `SELECT stock FROM vehicles WHERE id = ${vehicles_id}`
                db.query(checkStockQuery, (err, result) => {
                    if (err) return reject({ status: 500, err })

                    const { stock } = result[0]
                    let updateStock = {}

                    if (status_id === 2) updateStock = { stock: stock + quantity }
                    if (status_id === 1) updateStock = { stock: stock }

                    const updateStockQuery = `UPDATE vehicles set ? WHERE id = ${vehicles_id}`
                    db.query(updateStockQuery, updateStock, (err, result) => {
                        if (err) return reject({ status: 500, err })
                        resolve({ status: 200, result })
                    })
                })
            })

        })
    })
}

//Menghapus data history By ID
const delHistoryById = (body, userId) => {
    return new Promise((resolve, reject) => {
        const { id } = body

        let valuesId = ''
        let idArr = []

        id.forEach((data, idx) => {
            if (idx !== id.length - 1) {
                valuesId += ` id = ? OR `
            } else {
                valuesId += ` id = ? `
            }
            idArr.push(data)
        })

        const checkHistorybyuser = `SELECT * FROM historys WHERE ${valuesId}`

        db.query(checkHistorybyuser, idArr, (err, result) => {
            if (err) return reject({ status: 500, err })
            if (result.length === 0) return reject({ status: 400, err: 'oops your wrong id >_<' })

            const { users_id } = result[0]
            if (userId !== users_id) return reject({ status: 400, err: 'no your history data here' })


            let valueDeteleId = ''
            let idDeleteArr = []

            id.forEach((data, idx) => {
                if (idx !== id.length - 1) {
                    valueDeteleId += ` ( ? ) , `
                } else {
                    valueDeteleId += ` ( ? ) `
                }
                idDeleteArr.push(data)
            })

            let statusErr = false

            result.forEach((data) => {
                if (data.status_id === 2) {
                    statusErr = true
                }
            })

            if (statusErr === true) return reject({ status: 400, err: 'Have not returned the vehicle' })

            const DeleteHistory = `DELETE FROM historys WHERE (id) IN (${valueDeteleId})`
            db.query(DeleteHistory, idDeleteArr, (err, result) => {
                if (err) return reject({ status: 500, err })

                result = { msg: 'Success Deleted' }
                resolve({ status: 200, result })
            })
        })
    })
}

module.exports = {
    postNewHistory,
    getHistory,
    patchHistoryByIdModel,
    delHistoryById
}