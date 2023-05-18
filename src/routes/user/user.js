const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authenticateMiddleware = require('../../middleware/auth.js');
const createDBConnection = require('../../config/db.js');
const db = createDBConnection();
const userQuerys = require('./user.query.js');

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
    app.get('/user', authenticateMiddleware, async (req, res) => {
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        userQuerys.getAllUsers((err, result) => {
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

    app.get('/user/todos', authenticateMiddleware, async (req, res) => {
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        userQuerys.getTodosFromUser(userId, (err, result) => {
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
        }, userId);
    });

    app.get('/user/:data', authenticateMiddleware, async (req, res) => {
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        userQuerys.getUserFromData(req.params.data, req.params.data, (err, result) => {
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
        }, req.params.data, req.params.data);
    });

    app.put('/user/:id', authenticateMiddleware, async (req, res) => {
        const { email, password, firstname, name } = req.body;
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        if (userId !== parseInt(req.params.id)) {
            res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
            return;
        }
        userQuerys.checkEmail((err, result) => {
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
                userQuerys.updateUser((err, result) => {
                    userQuerys.getUserFromId(userId, (err, result) => {
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
                }, email, hashedPassword, firstname, name, userId);
            });
        }, email, userId);
    });

    app.delete('/user/:id', authenticateMiddleware, async (req, res) => {
        const userId = await UserIdFromToken(req.headers.authorization, res);
        if (!userId) {
            return;
        }
        if (userId !== parseInt(req.params.id)) {
            res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
            return;
        }
        userQuerys.deleteUserFromId(userId, (err, result) => {
            res.status(200).send(JSON.stringify({ msg: `Successfully deleted record number : ${userId}` }, null, 2) + '\n');
        });
    });
};
