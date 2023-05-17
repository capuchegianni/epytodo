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
        const query = `SELECT * FROM todo WHERE id = ?`;
        db.query(query, [req.params.data, req.params.data], (err, result) => {
            if (err || result.length === 0) {
                res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
            } else {
                if (result[0].id !== todoId) {
                    res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
                    return;
                }
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

    app.post('/todos', (req, res) => {
        res.send('Create a todo\n');
    });

    app.put('/todos/:id', (req, res) => {
        res.send('Edit a todo\n');
    });

    app.delete('/todos/:id', (req, res) => {
        res.send('Delete a todo\n');
    });
};
