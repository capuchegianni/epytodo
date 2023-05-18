const jwt = require('jsonwebtoken');
const authenticateMiddleware = require('../../middleware/auth.js');
const createDBConnection = require('../../config/db.js');
const db = createDBConnection();
const todoQuerys = require('./todos.query.js');

function TodoIdFromToken(authHeader, res) {
    return new Promise((resolve) => {
        const token = authHeader.split(' ')[1];
        const userEmail = jwt.decode(token, process.env.SECRET);
        const query = `SELECT t.id AS todo_id FROM user u JOIN todo t ON u.id = t.user_id WHERE u.email = ?`;
        db.query(query, [userEmail], (err, result) => {
            if (err || result.length === 0) {
                res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
                reject();
            } else {
                const todoIds = result.map((row) => row.todo_id);
                resolve(todoIds);
            }
        });
    });
}

function UserIdFromToken(authHeader, res) {
    return new Promise((resolve) => {
        const token = authHeader.split(' ')[1];
        const userEmail = jwt.decode(token, process.env.SECRET);
        const query = `SELECT id FROM user WHERE email = ?`;
        db.query(query, [userEmail], (err, result) => {
            if (err || result.length === 0) {
                res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
            } else {
                resolve(result[0].id);
            }
        });
    });
}

module.exports = function(app) {
    app.get('/todos', authenticateMiddleware, async (req, res) => {
        const todoId = await TodoIdFromToken(req.headers.authorization, res);
        if (!todoId) {
            return;
        }
        todoQuerys.getAllTodos((err, result) => {
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

    app.get('/todos/:id', authenticateMiddleware, async (req, res) => {
        const todoId = await TodoIdFromToken(req.headers.authorization, res);
        if (!todoId) {
            return;
        }
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        todoQuerys.getAllTodosIDFromUserID((err, result) => {
            if (err || result.length === 0) {
                res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
                return;
            }
            if (!result.some(row => row.id === parseInt(req.params.id))) {
                res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
                return;
            }
            todoQuerys.getTodoById((err, result) => {
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
            }, req.params.id);
        }, userId);
    });

    app.post('/todos', authenticateMiddleware, async (req, res) => {
        const { title, description, due_time, user_id, status } = req.body;
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        if (userId != user_id) {
            res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
            return;
        }
        todoQuerys.createTodo((err, new_id) => {
            if (err) {
                return;
            }
            todoQuerys.getTodoById((err, result) => {
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
            }, new_id.insertId);
        }, res, title, description, due_time, user_id, status);
    });

    app.put('/todos/:id', authenticateMiddleware, async (req, res) => {
        const { title, description, due_time, user_id, status } = req.body;
        const todoId = await TodoIdFromToken(req.headers.authorization, res);
        if (!todoId) {
            return;
        }
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        todoQuerys.getAllTodosIDFromUserID((err, result) => {
            if (err || result.length === 0) {
                res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
                return;
            }
            if (!result.some(row => row.id === parseInt(req.params.id))) {
                res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
                return;
            }
            todoQuerys.updateTodo((err, result) => {
                todoQuerys.getTodoById((err, result) => {
                    const todo = result[0];
                    const createdDt = new Date(todo.due_time);
                    createdDt.setHours(createdDt.getHours() + 2);
                    const formattedCreatedDt = createdDt.toISOString().replace('T', ' ').slice(0, 19);
                    const formattedTodo = {
                        title: todo.title,
                        description: todo.description,
                        due_time: formattedCreatedDt,
                        user_id: todo.user_id,
                        status: todo.status
                    };
                    res.status(200).send(JSON.stringify(formattedTodo, null, 2) + '\n');
                }, req.params.id);
            }, res, title, description, due_time, user_id, status, req.params.id);
        }, userId);
    });

    app.delete('/todos/:id', authenticateMiddleware, async (req, res) => {
        const todosId = await TodoIdFromToken(req.headers.authorization, res);
        if (!todosId) {
            return;
        }
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        todoQuerys.getAllTodosIDFromUserID((err, result) => {
            if (err || result.length === 0) {
                res.status(400).send(JSON.stringify({ msg: 'Not found' }, null, 2) + '\n');
                return;
            }
            if (!result.some(row => row.id === parseInt(req.params.id))) {
                res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
                return;
            }
            todoQuerys.deleteTodoByID((err, result) => {
                res.status(200).send(JSON.stringify({ msg: `Successfully deleted record number : ${req.params.id}` }, null, 2) + '\n');
            }, req.params.id);
        }, userId);
    });
};
