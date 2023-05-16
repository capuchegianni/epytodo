const express = require('express');
const app = express()
const mysql = require('mysql2');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_ROOT_PASSWORD
});

module.exports = function(app) {
    app.post('/register', (req, res) => {
        const { email, name, firstname, password } = req.body;
        const checkQuery = `SELECT * FROM user WHERE email = ?`;
        db.query(checkQuery, [email], (checkErr, checkResult) => {
            if (checkErr) {
                res.status(500).json({ msg: 'Internal server error' });
                return;
            }
            if (checkResult.length > 0) {
                res.status(400).json({ msg: 'Account already exists' });
                return;
            }
            const saltRounds = 10;
            bcrypt.hash(password, saltRounds, (hashErr, hashedPassword) => {
                if (hashErr) {
                    res.status(500).json({ msg: 'Internal server error' });
                    return;
                }
                const insertQuery = `INSERT INTO user (email, password, name, firstname) VALUES (?, ?, ?, ?)`;
                db.query(insertQuery, [email, hashedPassword, name, firstname], (insertErr) => {
                    if (insertErr) {
                        res.status(500).json({ msg: 'Internal server error' });
                        return;
                    }
                    const payload = { email: req.email };
                    const token = jwt.sign(payload, process.env.SECRET);
                    res.status(200).json({ token });
                });
            });
        });
    });

    app.post('/login', (req, res) => {
        res.send('Login Page!\n');
    });
};
