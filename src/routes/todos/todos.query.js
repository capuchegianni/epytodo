const createDBConnection = require('../../config/db.js');
const db = createDBConnection();

function getAllTodos(callback) {
    const query = `SELECT * FROM todo`;
    db.query(query, callback);
}

function getTodoById(callback, todoId) {
    const query = `SELECT * FROM todo WHERE id = ?`;
    db.query(query, [todoId], callback);
}

function getAllTodosIDFromUserID(callback, userId) {
    const query = `SELECT id FROM todo WHERE user_id = ?`;
    db.query(query, [userId], callback);
}

function createTodo(callback, res, title, description, due_time, userId, status) {
    const query = `INSERT INTO todo (title, description, due_time, user_id, status) VALUES (?, ?, ?, ?, ?)`;
    db.query(query, [title.toString(), description.toString(), due_time.toString(), userId.toString(), status.toString()], (err, result) => {
        if (err) {
            if (err.code === 'ER_TRUNCATED_WRONG_VALUE' || err.code === 'WARN_DATA_TRUNCATED' || err.code === 'ER_NO_REFERENCED_ROW_2') {
                res.status(400).send(JSON.stringify({ msg: 'Bad parameter' }, null, 2) + '\n');
            } else {
                res.status(500).send(JSON.stringify({ msg: 'Internal server error' }, null, 2) + '\n');
            }
            return;
        } else {
          callback(null, result);
        }
    });
}

function updateTodo(callback, res, title, description, due_time, userId, status, todoId) {
    const query = `UPDATE todo SET title = ?, description = ?, due_time = ?, user_id = ?, status = ? WHERE id = ?`;
    db.query(query, [title.toString(), description.toString(), due_time.toString(), userId.toString(), status.toString(), todoId.toString()], (err, result) => {
        if (err) {
            if (err.code === 'ER_TRUNCATED_WRONG_VALUE' || err.code === 'WARN_DATA_TRUNCATED' || err.code === 'ER_NO_REFERENCED_ROW_2') {
                res.status(400).send(JSON.stringify({ msg: 'Bad parameter' }, null, 2) + '\n');
            } else {
                res.status(500).send(JSON.stringify({ msg: 'Internal server error' }, null, 2) + '\n');
            }
            return;
        } else {
            callback(null, result);
        }
    });
}

function deleteTodoByID(callback, todoId) {
    const query = `DELETE FROM todo WHERE id = ?`;
    db.query(query, [todoId], callback);
}

module.exports = {
    getAllTodos,
    getTodoById,
    getAllTodosIDFromUserID,
    createTodo,
    updateTodo,
    deleteTodoByID
};
