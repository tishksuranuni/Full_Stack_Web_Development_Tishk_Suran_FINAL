const db = require('../../database');

const isAuthenticated = (req, res, next) => {
    const sessionToken = req.headers['x-authorization'];

    if (!sessionToken) {
        return res.status(401).json({ error_message: 'Unauthorised!' });
    }

    const SQL = 'SELECT user_id FROM users WHERE session_token = ?';

    db.get(SQL, [sessionToken], (error, row) => {
        if(error) {
            return res.status(500).json({ error_message: 'Internal server error, sorry!' });
        }

        if(!row) {
            return res.status(401).json({ error_message: 'Unauthorised!' })
        }

        req.userId = row.user_id;
        next()
    })
}

const optionalAuth = (req, res, next) => {
    const sessionToken = req.headers['x-authorization'];

    if (!sessionToken) {
        req.userId = null;
        return next();
    }

    const SQL = 'SELECT user_id FROM users WHERE session_token = ?';

    db.get(SQL, [sessionToken], (error, row) => {
        if(error) {
            return res.status(500).json({ error_message: 'Internal server error, sorry!' });
        }

        req.userId = row ? row.user_id : null;
        next()
    })
}

module.exports = {
    isAuthenticated,
    optionalAuth
};