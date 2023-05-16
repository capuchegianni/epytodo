const express = require('express')
require('dotenv').config( {path: '../.env'} );
const app = express()
const port = process.env.PORT || 3000;
require('./config/db.js');

app.use(express.json());
require('./routes/auth/auth.js')(app);
require('./routes/user/user.js')(app);
require('./routes/todos/todos.js')(app);

app.get('/', (req, res) => {
  res.send('Server running.\n');
});

app.listen(port, () => {
  console.log(`To do list running on port ${port}.`);
});
