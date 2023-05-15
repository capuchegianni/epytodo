const express = require('express');
const app = express()

module.exports = function(app) {
    app.get('/user', (req, res) => {
        res.send('See all users\n');
    });

    app.get('/user/todos', (req, res) => {
        res.send('View all user tasks\n');
    });

    app.get('/user/:id', (req, res) => {
        res.send('View user infos\n');
    });

    app.put('/user/:id', (req, res) => {
        res.send('Update user infos\n');
    });

    app.delete('/user/:id', (req, res) => {
        res.send('Delete a user\n');
    });
};