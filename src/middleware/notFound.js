const notFoundHandler = (res) => {
    res.status(400).json({ 'msg': 'Not Found' });
};

module.exports = notFoundHandler;
