const express = require('express');
const app = express()

module.exports = function(app) {
    app.post('/register', (req, res) => {
        res.send('Register Page!\n');
    });

    app.post('/login', (req, res) => {
        res.send('Login Page!\n');
    });
};
