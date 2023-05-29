const express = require('express')
require('dotenv').config( {path: '../.env'} );
const app = express();
const notFound = require('./middleware/notFound.js');
const port = process.env.PORT || 3000;
const createDBConnection = require('./config/db.js');
const db = createDBConnection();

app.listen(port, () => {
  console.log(`To do list running on port ${port}.`);
});

db.connect((err) => {
  if (err) throw err;
  console.log(`Connected to ${process.env.MYSQL_DATABASE} database !`);
});

app.get('/', (req, res) => {
  res.send('Server running.\n');
});

app.use(express.json());
require('./routes/auth/auth.js')(app);
require('./routes/user/user.js')(app);
require('./routes/todos/todos.js')(app);

app.use((req, res) => notFound(req, res));