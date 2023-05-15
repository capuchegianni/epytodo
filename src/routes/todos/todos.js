const express = require('express');
const app = express()

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

    app.delete('/todos/:id', (req, res) => {
        res.send('Delete a todo\n');
    });
};