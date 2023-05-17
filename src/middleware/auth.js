const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.SECRET, (err, user) => {
            if (err) {
                res.status(401).send(JSON.stringify({ msg:"Token is not valid" }, null, 2) + '\n');
            }
            req.user = user["id"]
            next();
        });
    } else {
        res.status(401).send(JSON.stringify({ msg:"No token , authorization denied" }, null, 2) + '\n');
    }
};