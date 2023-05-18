module.exports = (req, res) => {
    res.status(404).send(JSON.stringify({ msg: 'Not Found' }, null, 2) + '\n');
};
