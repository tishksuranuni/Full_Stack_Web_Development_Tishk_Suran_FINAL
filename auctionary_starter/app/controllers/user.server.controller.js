const userModel = require('../models/user.server.model');
const { userCreateSchema, validate } = require('../validators/validators');
const { generateSalt, hashPassword } = require('../lib/passwords');

const create = (req, res) => {
    const validation = validate(userCreateSchema, req.body);
    if (!validation.valid) {
        return res.status(400).json({ error_message: validation.error });
    }

    const allowedFields = ['first_name', 'last_name', 'email', 'password'];
    const bodyFields = Object.keys(req.body);
    const hasExtraFields = bodyFields.some(field => !allowedFields.includes(field));
    if (hasExtraFields) {
        return res.status(400).json({ error_message: 'Extra fields not allowed!' });
    }

    userModel.findByEmail(req.body.email, (error, existingUser) => {
        if(error) {
            return res.status(500).json({ error_message: 'Internal service error :('});
        }

        if(existingUser) {
            return res.status(400).json({ error_message: 'Email already exists :/'});
        }

        const salt = generateSalt();
        const hashedPassword = hashPassword(req.body.password, salt);

        const userData = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: hashedPassword,
            salt: salt
        };

        userModel.create(userData, (error, result) => {
            if(error) {
                return res.status(500).json({ error_message: 'Internal sever error!' });
            }

            res.status(201).json({ user_id: result.user_id });
        });
    });
};

const getOne = (req, res) => {
    const userId = parseInt(req.params.user_id, 10);

        if (isNaN(userId)) {
        return res.status(404).json({ error_message: 'User not found!' });
    }

    userModel.getProfile(userId, (error, profile) => {
        if (error) {
            return res.status(500).json({ error_message: 'Internal server error!' });
        }

        if (!profile) {
            return res.status(404).json({ error_message: 'User not found!' });
        }

        res.status(200).json(profile);
    });
};

module.exports = {
    create,
    getOne
};