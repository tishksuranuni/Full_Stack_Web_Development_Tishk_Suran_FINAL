const crypto = require('crypto');

const generateSalt = () => {
    return crypto.randomBytes(16).toString('hex');
}

const hashPassword = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

const generateSessionToken = () => {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = {
    generateSalt, 
    hashPassword, 
    generateSessionToken
}