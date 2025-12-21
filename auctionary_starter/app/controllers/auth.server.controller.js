const userModel = require('../models/user.server.model');

const { loginSchema, validate } = require('../validators/validators');
const { hashPassword, generateSessionToken } = require('../lib/passwords');

const login = (req, res) => {
    const validation = validate(loginSchema, req.body);
    if (!validation.valid) {
        return res.status(400).json({ error_message: validation.error });
    }

    const allowedFields = ['email', 'password'];
    const bodyFields = Object.keys(req.body);
    const hasExtraFields = bodyFields.some(field => !allowedFields.includes(field));
    if (hasExtraFields) {
        return res.status(400).json({ error_message: 'Extra fields not allowed!' });
    }

    userModel.findByEmail(req.body.email, (error, user) => {
        if (error) {
            return res.status(500).json({ error_message: 'Internal server error! '});
        }

        if (!user) {
            return res.status(400).json({ error_message: 'Invalid email or password!' });
        }

        const hashedPassword = hashPassword(req.body.password, user.salt);
        if (hashedPassword !== user.password) {
            return res.status(400).json({ error_message: 'Invalid email or password!' });
        }
        
        if (user.session_token) {
            return res.status(200).json({
                user_id: user.user_id,
                session_token: user.session_token
            });
        }
        const sessionToken = generateSessionToken();
        
        userModel.updateSessionToken(user.user_id, sessionToken, (err) => {
            if (err) {
                return res.status(500).json({ error_message: 'Internal server error!' });
            }
            
            res.status(200).json({
                user_id: user.user_id,
                session_token: sessionToken
            });
        });
    });
};

const logout = (req, res) => {
    const sessionToken = req.headers['x-authorization'];
    
    if (!sessionToken) {
        return res.status(401).json({ error_message: 'Unauthorised!' });
    }
    
    userModel.findBySessionToken(sessionToken, (err, user) => {
        if (err) {
            return res.status(500).json({ error_message: 'Internal server error!' });
        }
        
        if (!user) {
            return res.status(401).json({ error_message: 'Unauthorised!' });
        }
        
        userModel.clearSessionToken(sessionToken, (err, success) => {
            if (err) {
                return res.status(500).json({ error_message: 'Internal server error!' });
            }
            
            res.status(200).json({ message: 'Logged out successfully, goodbye my friend!' });
        });
    });
};

module.exports = {
    login,
    logout
};