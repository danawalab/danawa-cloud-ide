var mysql = require('mysql');
const db = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'react'
});

module.exports = db;