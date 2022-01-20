// import/setup/koneksi mysql/database
const mysql = require('mysql2')

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.UNAME,
    password: process.env.PASS,
    database: process.env.DB,
})

// export database
module.exports = db;