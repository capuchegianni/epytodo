require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const createDBConnection = require('../../config/db.js');
const db = createDBConnection();

module.exports = function(app) {
    app.post('/register', (req, res) => {
        const { email, name, firstname, password } = req.body;
        const checkQuery = `SELECT * FROM user WHERE email = ?`;
        db.query(checkQuery, [email], (checkErr, checkResult) => {
            if (checkErr) {
                res.status(500).send(JSON.stringify({ msg: 'Internal server error' }, null, 2) + '\n');
                return;
            }
            if (checkResult.length > 0) {
                res.status(400).send(JSON.stringify({ msg: 'Account already exists' }, null, 2) + '\n');
                return;
            }
            const saltRounds = 10;
            bcrypt.hash(password, saltRounds, (hashErr, hashedPassword) => {
                if (hashErr) {
                    res.status(500).send(JSON.stringify({ msg: 'Internal server error' }, null, 2) + '\n');
                    return;
                }
                const insertQuery = `INSERT INTO user (email, password, name, firstname) VALUES (?, ?, ?, ?)`;
                db.query(insertQuery, [email, hashedPassword, name, firstname], (insertErr) => {
                    if (insertErr) {
                        res.status(500).send(JSON.stringify({ msg: 'Internal server error' }, null, 2) + '\n');
                        return;
                    }
                    var token = jwt.sign(req.body.email, process.env.SECRET)
                    res.type('application/json')
                    res.set('token', token)
                    res.status(200).send(JSON.stringify({ token: token }, null, 2) + '\n');
                });
            });
        });
    });

    app.post('/login', (req, res) => {
        const { email, password } = req.body;
        const checkQuery = `SELECT * FROM user WHERE email = ?`;
        db.query(checkQuery, [email], (checkErr, checkResult) => {
            if (checkErr) {
                res.status(500).send(JSON.stringify({ msg: 'Internal server error' }, null, 2) + '\n');
                return;
            }
            if (checkResult.length === 0) {
                res.status(400).send(JSON.stringify({ msg: 'Account does not exist' }, null, 2) + '\n');
                return;
            }
            const hashedPassword = checkResult[0].password;
            bcrypt.compare(password, hashedPassword, (compareErr, compareResult) => {
                if (compareErr) {
                    res.status(500).send(JSON.stringify({ msg: 'Internal server error' }, null, 2) + '\n');
                    return;
                }
                if (!compareResult) {
                    res.status(400).send(JSON.stringify({ msg: 'Invalid Credentials' }, null, 2) + '\n');
                    return;
                }
                var token = jwt.sign(req.body.email, process.env.SECRET)
                res.type('application/json')
                res.set('token', token)
                res.status(200).send(JSON.stringify({ token: token }, null, 2) + '\n');
            });
        });
    });
};
