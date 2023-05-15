const express = require('express')
const dotenv = require('dotenv').config( {path: '../.env'} );
const bodyParser = require('body-parser');
const app = express()
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
require('./routes/auth/auth.js')(app);
require('./routes/user/user.js')(app);
require('./routes/todos/todos.js')(app);

app.listen(port, () => {
  console.log(`To do list running on port ${port}`);
});