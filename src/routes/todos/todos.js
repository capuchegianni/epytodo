const express = require('express');
const app = express()
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_ROOT_PASSWORD
});

function TodoIdFromToken(authHeader, res) {
    if (!authHeader) {
        res.status(401).send(JSON.stringify({ msg: 'No token, authorization denied' }, null, 2) + '\n');
        return;
    }
    return new Promise((resolve) => {
        try {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.SECRET);
            const userEmail = jwt.decode(token, process.env.SECRET);
            const query = `SELECT t.id AS todo_id FROM user u JOIN todo t ON u.id = t.user_id WHERE u.email = ?`;
            db.query(query, [userEmail], (err, result) => {
                if (err || result.length === 0) {
                    res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
                    return;
                } else {
                    const todoIds = result.map((row) => row.todo_id);
                    resolve(todoIds);
                }
            });
        } catch (err) {
            res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
        }
    });
}

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
    app.get('/todos', async (req, res) => {
        const todoId = await TodoIdFromToken(req.headers.authorization, res);
        if (!todoId) {
            return;
        }
        const query = `SELECT * FROM todo`;
        db.query(query, (err, result) => {
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

    app.get('/todos/:id', async (req, res) => {
        const todoId = await TodoIdFromToken(req.headers.authorization, res);
        if (!todoId) {
            return;
        }
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        const query = `SELECT id FROM todo WHERE user_id = ?`;
        db.query(query, [userId], (err, result) => {
            if (err || result.length === 0) {
                res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
                return;
            }
            if (!result.some(row => row.id === parseInt(req.params.id))) {
                res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
                return;
            }
            const query = `SELECT * FROM todo WHERE id = ?`;
            db.query(query, [req.params.id], (err, result) => {
                if (err || result.length === 0) {
                    res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
                } else {
                    const todo = result[0];
                    const createdAt = new Date(todo.created_at);
                    createdAt.setHours(createdAt.getHours() + 2);
                    const formattedCreatedAt = createdAt.toISOString().replace('T', ' ').slice(0, 19);
                    const createdDt = new Date(todo.due_time);
                    createdDt.setHours(createdDt.getHours() + 2);
                    const formattedCreatedDt = createdDt.toISOString().replace('T', ' ').slice(0, 19);
                    const formattedTodo = {
                        id: todo.id,
                            title: todo.title,
                            description: todo.description,
                            createdAt: formattedCreatedAt,
                            due_time: formattedCreatedDt,
                            user_id: todo.user_id,
                            status: todo.status
                    };
                    res.status(200).send(JSON.stringify(formattedTodo, null, 2) + '\n');
                }
            });
        });
    });

    app.post('/todos', async (req, res) => {
        const { title, description, due_time, user_id, status } = req.body;
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        if (userId != user_id) {
            res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
            return;
        }
        const query = `INSERT INTO todo (title, description, due_time, user_id, status) VALUES (?, ?, ?, ?, ?)`;
        db.query(query, [title, description, due_time, userId, status], (err, new_id) => {
            if (err) {
                if (err.code === 'ER_TRUNCATED_WRONG_VALUE') {
                    res.status(400).send(JSON.stringify({ msg: 'Bad parameter' }, null, 2) + '\n');
                    return;
                }
                res.status(400).send(JSON.stringify({ msg: 'Internal sever error' }, null, 2) + '\n');
                return;
            }
            db.query(`SELECT * FROM todo WHERE id = ?`, [new_id.insertId], (err, result) => {
                const todo = result[0];
                const createdAt = new Date(todo.created_at);
                createdAt.setHours(createdAt.getHours() + 2);
                const formattedCreatedAt = createdAt.toISOString().replace('T', ' ').slice(0, 19);
                const createdDt = new Date(todo.due_time);
                createdDt.setHours(createdDt.getHours() + 2);
                const formattedCreatedDt = createdDt.toISOString().replace('T', ' ').slice(0, 19);
                const formattedTodo = {
                    id: todo.id,
                    title: todo.title,
                    description: todo.description,
                    createdAt: formattedCreatedAt,
                    due_time: formattedCreatedDt,
                    user_id: todo.user_id,
                    status: todo.status
                };
                res.status(200).send(JSON.stringify(formattedTodo, null, 2) + '\n');
            });
        });
    });

    app.put('/todos/:id', async (req, res) => {
        const { title, description, due_time, user_id, status } = req.body;
        const todoId = await TodoIdFromToken(req.headers.authorization, res);
        if (!todoId) {
            return;
        }
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        const query = `SELECT id FROM todo WHERE user_id = ?`;
        db.query(query, [userId], (err, result) => {
            if (err || result.length === 0) {
                res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
                return;
            }
            if (!result.some(row => row.id === parseInt(req.params.id))) {
                res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
                return;
            }
            const query = `UPDATE todo SET title = ?, description = ?, due_time = ?, user_id = ?, status = ? WHERE id = ?`;
            db.query(query, [title, description, due_time, user_id, status, req.params.id], (err) => {
                if (err) {
                    if (err.code === 'ER_TRUNCATED_WRONG_VALUE') {
                        res.status(400).send(JSON.stringify({ msg: 'Bad parameter' }, null, 2) + '\n');
                        return;
                    }
                    res.status(400).send(JSON.stringify({ msg: 'Internal sever error' }, null, 2) + '\n');
                    return;
                }
                db.query(`SELECT * FROM todo WHERE id = ?`, [req.params.id], (err, result) => {
                    const todo = result[0];
                    const createdAt = new Date(todo.created_at);
                    createdAt.setHours(createdAt.getHours() + 2);
                    const formattedCreatedAt = createdAt.toISOString().replace('T', ' ').slice(0, 19);
                    const createdDt = new Date(todo.due_time);
                    createdDt.setHours(createdDt.getHours() + 2);
                    const formattedCreatedDt = createdDt.toISOString().replace('T', ' ').slice(0, 19);
                    const formattedTodo = {
                        id: todo.id,
                            title: todo.title,
                            description: todo.description,
                            createdAt: formattedCreatedAt,
                            due_time: formattedCreatedDt,
                            user_id: todo.user_id,
                            status: todo.status
                    };
                    res.status(200).send(JSON.stringify(formattedTodo, null, 2) + '\n');
                });
            });
        });
    });

    app.delete('/todos/:id', async (req, res) => {
        const todosId = await TodoIdFromToken(req.headers.authorization, res);
        if (!todosId) {
            return;
        }
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        const query = `SELECT id FROM todo WHERE user_id = ?`;
        db.query(query, [userId], (err, result) => {
            if (err || result.length === 0) {
                res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
            }
            if (!result.some(row => row.id === parseInt(req.params.id))) {
                res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
                return;
            }
            const query = `DELETE FROM todo WHERE id = ?`;
            db.query(query, [req.params.id], () => {
                res.status(200).send(JSON.stringify({ msg: `Successfully deleted record number : ${req.params.id}` }, null, 2) + '\n');
            });
        });
    });
};
