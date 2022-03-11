const mysql = require('mysql');
const db = require('../database/db')

// menambahkan data pembeli baru
const postNewHistory = (body, id) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = 'INSERT INTO historys SET ?'
        body = {
            ...body,
            users_id: id
        }
        db.query(sqlQuery, body, (err, result) => {
            if (err) return reject({ status: 500, err })
            if (body.rating > 5) reject({ status: 401, err: 'Maksimal 5' })
            resolve({ status: 200, result })
        })
    })
}

const getHistory = (query) => {
    return new Promise((resolve, reject) => {
        let sqlQuery = `SELECT h.id, u.name AS "users",
        g.name AS "gender", v.name AS "vehicle", t.name AS "type", v.locations,
        v.price, h.date_time AS "date", h.rating
        FROM historys h
        JOIN users u ON h.users_id = u.id
        JOIN genders g ON u.gender_id = g.id
        JOIN vehicles v ON h.vehicles_id = v.id
        JOIN types t ON v.types_id = t.id`

        const statment = []

        // link sinkron ketika perubahaan query/value
        let querySearch = '';
        let searchKeyword = '';
        let queryFilter = '';

        // searching
        let keyword = "%%";
        if (query.name) keyword = `%${query.name}%`, sqlQuery += ` WHERE u.name LIKE "${keyword}"`
        querySearch = 'name', searchKeyword = `${query.name}`;

        // filter
        let filter = '';
        if (query.gender) filter = `${query.gender}`, sqlQuery += ` AND g.id = "${filter}"`,
            queryFilter = 'gender';
        if (query.vehicle) filter = `${query.vehicle}`, sqlQuery += ` AND v.id = "${filter}"`,
            queryFilter = 'vehicle';
        if (query.type) filter = `${query.type}`, sqlQuery += ` AND t.id = "${filter}"`,
            queryFilter = 'type';
        if (query.location) filter = `${query.location}`, sqlQuery += ` AND l.id = "${filter}"`,
            queryFilter = 'location';

        // order by
        const order = query.order;
        let orderBy = "";
        if (query.by && query.by.toLowerCase() == "users") orderBy = "u.name"
        if (query.by && query.by.toLowerCase() == "genders") orderBy = "g.name"
        if (query.by && query.by.toLowerCase() == "type") orderBy = "t.name"
        if (query.by && query.by.toLowerCase() == "location") orderBy = "l.name"
        if (query.by && query.by.toLowerCase() == "price") orderBy = "v.price"
        if (query.by && query.by.toLowerCase() == "id") orderBy = "h.id"
        if (order && orderBy) {
            sqlQuery += " ORDER BY ? ?"
            statment.push(mysql.raw(orderBy), mysql.raw(order))
        }

        // limit and offset
        const page = parseInt(query.page)
        const limit = parseInt(query.limit)
        if (query.page && query.limit) {
            sqlQuery += " Limit ? OFFSET ?"
            const offset = (page - 1) * limit
            statment.push(limit, offset)
        }

        const countQuery = `select count(*) as "count" from historys`
        db.query(countQuery, (err, result) => {
            if (err) return reject({ status: 500, err })

            // paginasi
            const count = result[0].count
            // links tujuan paginasi
            let links = '/historys?'
            let link1 = `${querySearch}=${searchKeyword}`
            let link2 = `${queryFilter}=${filter}`
            let link3 = `by=${query.by}&order=${order}`
            // pernyataan key
            const bySearch = query.name;
            const byFilter = query.gender || query.vehicle
                || query.type || query.location
            const byOrderBy = order && orderBy
            // jika hanya 1 key
            if (bySearch) links += link1
            if (byFilter) links += link2
            if (byOrderBy) links += link3
            // jika ada 2 key
            if (bySearch && byFilter) links = `${link1}&${link2}`
            if (bySearch && byOrderBy) links = `${link1}&${link3}`
            if (byFilter && byOrderBy) links = `${link2}&${link3}`
            //jika ada tiga key
            if (bySearch && byFilter && byOrderBy) links = `${link1}&${link2}&${link3}`

            const meta = {
                next:
                    page == Math.ceil(count / limit)
                        ? null
                        : links += `&limit=${limit}&page=${page + 1}`,
                prev:
                    page == 1
                        ? null
                        : links += `&limit=${limit}&page=${page - 1}`,
                count,
            };

            db.query(sqlQuery, statment, (err, result) => {
                if (err) return reject({ status: 500, err });
                resolve({ status: 200, result: { data: result, meta } })
            })
        })
    });
}

const getPopularVehicle = (query) => {
    return new Promise((resolve, reject) => {
        let sqlQuery = `SELECT h.id, v.name AS "Vehicles", v.image as 'image',v.locations
        ,u.name AS testimony,u.image AS 'profile', h.comment,
        COUNT(v.name) AS "Rented",
        ROUND((count(users_id)/(SELECT count(vehicles_id) FROM historys))*10,2) AS "rating"
        FROM historys h
        JOIN vehicles v ON h.vehicles_id = v.id
        JOIN users u ON h.users_id = u.id
        GROUP BY v.name ORDER BY rating DESC`

        const statment = []


        // limit and offset
        // const page = parseInt(query.page);
        const limit = parseInt(query.limit)
        if (query.limit) {
            sqlQuery += " Limit ?";
            // const offset = (page - 1) * limit;
            statment.push(limit);
        }


        db.query(sqlQuery, statment, (err, result) => {
            if (err) return reject({ status: 500, err })
            resolve({ status: 200, result });
            console.log(result)
        })
    })
}

//Menghapus data history By ID
const delHistoryById = (idHistory) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `DELETE FROM historys WHERE id = ${idHistory}`
        db.query(sqlQuery, (err, result) => {
            if (err) return reject({ status: 500, err })
            resolve({ status: 200, result })
        })
    })
}

module.exports = {
    postNewHistory,
    getHistory,
    getPopularVehicle,
    delHistoryById
};