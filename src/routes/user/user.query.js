const createDBConnection = require('../../config/db.js');
const db = createDBConnection();

function getAllUsers(callback) {
    const query = `SELECT * FROM user`;
    db.query(query, callback);
}

function getTodosFromUser(userId, callback) {
    const query = `SELECT * FROM todo WHERE user_id = ?`;
    db.query(query, [userId], callback);
}

function getUserFromData(id, email, callback) {
    const query = `SELECT * FROM user WHERE id = ? OR email = ?`;
    db.query(query, [id, email], callback);
}

function checkEmail(callback, email, userId) {
    const query = `SELECT * FROM user WHERE email = ? AND id != ?`;
    db.query(query, [email.toString(), userId.toString()], (err, result) => {
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

function updateUser(callback, email, password, firstname, name, userId) {
    const query = `UPDATE user SET email = ?, password = ?, firstname = ?, name = ? WHERE id = ?`;
    db.query(query, [email, password, firstname, name, userId], (err, result) => {
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

function getUserFromId(userId, callback) {
    const query = `SELECT * FROM user WHERE id = ?`;
    db.query(query, [userId.toString()], callback);
}

function deleteUserFromId(userId, callback) {
    const query = `DELETE FROM user WHERE id = ?`;
    db.query(query, [userId.toString()], callback);
}

module.exports = {
    getAllUsers,
    getTodosFromUser,
    getUserFromData,
    checkEmail,
    updateUser,
    getUserFromId,
    deleteUserFromId
};