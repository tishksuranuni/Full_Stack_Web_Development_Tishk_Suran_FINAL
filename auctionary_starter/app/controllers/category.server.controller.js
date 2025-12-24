const categoryModel = require('../models/category.server.model');

/**
 * Get all categories
 */
const getAll = (req, res) => {
    categoryModel.getAll((error, categories) => {
        if (error) {
            return res.status(500).json({ error_message: 'Internal server error!' });
        }

        res.status(200).json(categories);
    });
};

module.exports = {
    getAll
};
