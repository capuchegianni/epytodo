const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_ROOT_PASSWORD
});

function UserIdFromToken(authHeader, res) {
    if (!authHeader) {
        res.status(401).send(JSON.stringify({ msg: 'No token, authorization denied' }, null, 2) + '\n');
        return;
    }
    return new Promise((resolve) => {
        try {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.SECRET);
            const userEmail = jwt.decode(token, process.env.SECRET);
            const query = `SELECT id FROM user WHERE email = ?`;
            db.query(query, [userEmail], (err, result) => {
                if (err || result.length === 0) {
                    res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
                } else {
                    resolve(result[0].id);
                }
            });
        } catch (err) {
            res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
        }
    });
}

module.exports = function(app) {
    app.get('/user', async (req, res) => {
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        const query = `SELECT * FROM user`;
        db.query(query, (err, result) => {
            if (err) {
                res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
            } else {
                const formattedResult = result.map((user) => {
                    const createdAt = new Date(user.created_at);
                    createdAt.setHours(createdAt.getHours() + 2);
                    const formattedCreatedAt = createdAt.toISOString().replace('T', ' ').slice(0, 19);
                    return {
                        id: user.id,
                        email: user.email,
                        password: user.password,
                        createdAt: formattedCreatedAt,
                        firstname: user.firstname,
                        name: user.name
                    };
                });
                res.status(200).send(JSON.stringify(formattedResult, null, 2) + '\n');
            }
        });
    });

    app.get('/user/todos', async (req, res) => {
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        const query = `SELECT * FROM todo WHERE user_id = ?`;
        db.query(query, [userId], (err, result) => {
            if (err) {
                res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
            } else {
                const formattedResult = result.map((todo) => {
                    const createdAt = new Date(todo.created_at);
                    createdAt.setHours(createdAt.getHours() + 2);
                    const formattedCreatedAt = createdAt.toISOString().replace('T', ' ').slice(0, 19);
                    return {
                        id: todo.id,
                        title: todo.title,
                        description: todo.description,
                        createdAt: formattedCreatedAt,
                        due_time: todo.due_time,
                        user_id: todo.user_id,
                        status: todo.status
                    };
                });
                res.status(200).send(JSON.stringify(formattedResult, null, 2) + '\n');
            }
        });
    });

    app.get('/user/:data', async (req, res) => {
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        const query = `SELECT * FROM user WHERE id = ? OR email = ?`;
        db.query(query, [req.params.data, req.params.data], (err, result) => {
            if (err || result.length === 0) {
                res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
            } else {
                if (result[0].id !== userId) {
                    res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
                    return;
                }
                const user = result[0];
                const createdAt = new Date(user.created_at);
                createdAt.setHours(createdAt.getHours() + 2);
                const formattedCreatedAt = createdAt.toISOString().replace('T', ' ').slice(0, 19);
                const formattedUser = {
                    id: user.id,
                    email: user.email,
                    password: user.password,
                    createdAt: formattedCreatedAt,
                    firstname: user.firstname,
                    name: user.name
                };
                res.status(200).send(JSON.stringify(formattedUser, null, 2) + '\n');
            }
        });
    });

    app.put('/user/:id', async (req, res) => {
        const { email, password, firstname, name } = req.body;
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        if (userId !== parseInt(req.params.id)) {
            res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
            return;
        }
        db.query(`SELECT email FROM user WHERE email = ? AND id != ?`, [email, userId], (result) => {
            if (result.length > 0) {
                res.status(400).send(JSON.stringify({ msg: 'Account already exists' }, null, 2) + '\n');
                return;
            }
            const saltRounds = 10;
            bcrypt.hash(password, saltRounds, (hashErr, hashedPassword) => {
                if (hashErr) {
                    res.status(500).send(JSON.stringify({ msg: 'Internal server error' }, null, 2) + '\n');
                    return;
                }
                const query = `UPDATE user SET email = ?, password = ?, firstname = ?, name = ? WHERE id = ?`;
                db.query(query, [email, hashedPassword, firstname, name, userId], () => {
                    db.query(`SELECT * FROM user WHERE id = ?`, [userId], (err, result) => {
                        if (err) {
                            res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
                        } else {
                            const user = result[0];
                            const createdAt = new Date(user.created_at);
                            createdAt.setHours(createdAt.getHours() + 2);
                            const formattedCreatedAt = createdAt.toISOString().replace('T', ' ').slice(0, 19);
                            const formattedUser = {
                                id: user.id,
                                email: user.email,
                                password: user.password,
                                createdAt: formattedCreatedAt,
                                firstname: user.firstname,
                                name: user.name
                            };
                            res.status(200).send(JSON.stringify(formattedUser, null, 2) + '\n');
                        }
                    });
                });
            });
        });
    });

    app.delete('/user/:id', async (req, res) => {
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        if (userId !== parseInt(req.params.id)) {
            res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
            return;
        }
        const query = `DELETE FROM user WHERE id = ?`;
        db.query(query, [userId], () => {
            res.status(200).send(JSON.stringify({ msg: `Successfully deleted record number : ${userId}` }, null, 2) + '\n');
        });
    });
};
