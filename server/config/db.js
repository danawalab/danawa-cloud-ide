var mysql = require('mysql');
const db = mysql.createPool({
    host : 'localhost',
    user : 'danawa',
    password : '1111',
    database : 'react'
});

module.exports = db;