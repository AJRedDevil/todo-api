module.exports = (db) => {
    
    return {
        requireAuthentication: (req, res, next) => {
            var token = req.get('Auth');

            db.user.findByToken(token).then((user) => {
                req.user = user;
                next();
            }, () => {
                res.status(401).send();
            });
        }
    };
};