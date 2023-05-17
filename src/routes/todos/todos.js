const express = require('express');
const app = express()

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
    app.get('/todos', (req, res) => {
        res.send('See all todos\n');
    });

    app.get('/todos/:id', (req, res) => {
        res.send('See a todo\n');
    });

    app.post('/todos', (req, res) => {
        res.send('Create a todo\n');
    });

    app.put('/todos/:id', (req, res) => {
        res.send('Edit a todo\n');
    });

    app.delete('/todos/:id', async (req, res) => {
        const todosId = await TodoIdFromToken(req.headers.authorization, res);
        if (!todosId) {
            return;
        }
        if (userId !== parseInt(req.params.id)) {
            res.status(401).send(JSON.stringify({ msg: 'Token is not valid' }, null, 2) + '\n');
            return;
        }
        const query = `DELETE FROM todo WHERE id = ?`;
        db.query(query, [todosId], () => {
            res.status(200).send(JSON.stringify({ msg: `Successfully deleted record number : ${todosId}` }, null, 2) + '\n');
        });
    });
};
