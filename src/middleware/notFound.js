const notFoundHandler = (res) => {
    res.status(401).send(JSON.stringify({ msg: 'Not Found' }, null, 2) + '\n');
};

module.exports = notFoundHandler;
