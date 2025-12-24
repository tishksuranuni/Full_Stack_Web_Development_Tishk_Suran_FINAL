const categoryController = require('../controllers/category.server.controller');

module.exports = function(app) {
    app.route('/categories')
        .get(categoryController.getAll);
};
