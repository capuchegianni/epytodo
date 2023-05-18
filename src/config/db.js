const mysql = require('mysql2');
require('dotenv').config();

function createDBConnection() {
    return mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        database: process.env.MYSQL_DATABASE,
        password: process.env.MYSQL_ROOT_PASSWORD
    });
}

module.exports = createDBConnection;
