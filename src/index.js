const express = require('express')
require('dotenv').config( {path: '../.env'} );
const app = express()
const port = process.env.PORT || 3000;

app.use(express.json());
require('./routes/auth/auth.js')(app);
require('./routes/user/user.js')(app);
require('./routes/todos/todos.js')(app);

app.listen(port, () => {
  console.log(`To do list running on port ${port}`);
});
