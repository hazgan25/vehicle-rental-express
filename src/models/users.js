const mysql = require('mysql');
const db = require('../database/db');
const bcrypt = require('bcrypt');



// menambahkan 1 user
const postNewUser = (body) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `INSERT INTO users SET ?`;
        bcrypt
            .hash(body.password, 10)
            .then((hashedPassword) => {
                const bodyWithHashedPassword = {
                    ...body,
                    password: hashedPassword,
                }
                db.query(sqlQuery, [bodyWithHashedPassword], (err, result) => {
                    if (err) reject({ status: 500, err });
                    resolve({ status: 201, result });
                })
            })
            .catch((err) => {
                reject({ status: 500, err });
            })
    })
}

// melihat user multi
const getUser = (query) => {
    return new Promise((resolve, reject) => {
        let sqlQuery = `SELECT u.id, u.name AS "name", u.email,
        g.name AS "genders", r.name AS "role" from users u
        JOIN genders g ON u.gender_id = g.id
        JOIN roles r ON u.roles_id = r.id`;
        const statment = [];

        // link sinkron ketika perubahan query/value
        let querySearch = ''; //berdasarkan apa yang di search etc name/email
        let searchKeyword = ''; //berdasatkan searching keyword etc pete
        let queryFilter = ''; //berdasarkan apa yang di filter etc gender/role

        // searching
        let keyword = "";
        if (query.name) keyword = `%${query.name}%`, sqlQuery += ` WHERE u.name LIKE "${keyword}"`,
            querySearch = 'name', searchKeyword = `${query.name}`;
        if (query.email) keyword = `%${query.email}%`, sqlQuery += ` WHERE u.email LIKE "${keyword}"`,
            querySearch = 'email', searchKeyword = `${query.email}`;

        // filter
        let filter = '';
        if (query.gender) filter = `${query.gender}`, sqlQuery += ` AND g.id = "${filter}"`,
            queryFilter = 'gender';
        if (query.role) filter = `${query.role}`, sqlQuery += ` AND r.id = "${filter}"`,
            queryFilter = 'role';

        // order & by
        const order = query.order;
        let orderBy = "";
        if (query.by && query.by.toLowerCase() == "name") orderBy = "u.name";
        if (query.by && query.by.toLowerCase() == "email") orderBy = "u.email";
        if (query.by && query.by.toLowerCase() == "id") orderBy = "u.id";
        if (order && orderBy) {
            sqlQuery += " ORDER BY ? ?";
            statment.push(mysql.raw(orderBy), mysql.raw(order));
        }

        // limit and offset
        const page = parseInt(query.page);
        const limit = parseInt(query.limit);
        if (query.page && query.limit) {
            sqlQuery += " Limit ? OFFSET ?";
            const offset = (page - 1) * limit;
            statment.push(limit, offset);
        }

        const countQuery = `select count(*) as "count" from users`;
        db.query(countQuery, (err, result) => {
            if (err) return reject({ status: 500, err });

            // paginasi
            const count = result[0].count;
            // link tujuan paginasi
            let linksResult = '';
            let links = '/users?';
            let link1 = `${querySearch}=${searchKeyword}`;
            let link2 = `${queryFilter}=${filter}`;
            let link3 = `by=${query.by}&order=${order}`;
            // pernyataan key
            const bySearch = query.name || query.email;
            const byFilter = query.gender || query.role;
            const byOrderBy = order && orderBy;
            // jika hanya salah satu key
            if (bySearch) linksResult = links + link1;
            if (byFilter) linksResult = links + link2;
            if (byOrderBy) linksResult = links + link3;
            // jika ada dua key
            if (bySearch && byFilter) linksResult = `${links}${link1}&${link2}`;
            if (bySearch && byOrderBy) linksResult = `${links}${link1}&${link3}`;
            if (byFilter && byOrderBy) linksResult = `${links}${link2}&${link3}`;
            //jika ada tiga key
            if (bySearch && byFilter && byOrderBy) linksResult = `${links}${link1}&${link2}&${link3}`;

            const linkNext = `${linksResult}&limit=${limit}&page=${page + 1}`;
            const linkPrev = `${linksResult}&limit=${limit}&page=${page - 1}`;

            const meta = {
                next:
                    page == Math.ceil(count / limit)
                        ? null
                        : linkNext,
                prev:
                    page == 1
                        ? null
                        : linkPrev,
                count,
            };

            db.query(sqlQuery, statment, (err, result) => {
                if (err) return reject({ status: 500, err });
                resolve({ status: 200, result: { data: result, meta } });
            })
        })
    });
}

// update user PUT
const updateUser = (body, id) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `UPDATE users SET ? WHERE id = ${id}`;
        bcrypt
            .hash(body.password, 10)
            .then((hashedPassword) => {
                const bodyWithHashedPassword = {
                    ...body,
                    password: hashedPassword
                }
                db.query(sqlQuery, [bodyWithHashedPassword, id], (err, result) => {
                    if (err) return reject({ status: 500, err });
                    resolve({ status: 200, result });
                })
            })
    })
}

// upgrade User to owner
const upgradeUser = (id) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `UPDATE users SET roles_id = 3 WHERE id = ${id}`;
        db.query(sqlQuery, (err, result) => {
            if (err) return reject({ status: 500, err });
            resolve({ status: 200, result });
        })
    })
}

// menghapus user
const delUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sqlQuery = `DELETE FROM users WHERE id = ${id}`;
        db.query(sqlQuery, (err, result) => {
            if (err) return reject({ status: 500, err });
            resolve({ status: 200, result });
        })
    })
}



module.exports = {
    postNewUser,
    getUser,
    updateUser,
    upgradeUser,
    delUserById
}