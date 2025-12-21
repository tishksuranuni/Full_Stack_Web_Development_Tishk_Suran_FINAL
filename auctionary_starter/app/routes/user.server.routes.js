const userController = require('../controllers/user.server.controller');
const authController = require('../controllers/auth.server.controller');

module.exports = function(app) {
    app.route('/users')
        .post(userController.create);
    
    app.route('/users/:user_id')
        .get(userController.getOne);
    
    app.route('/login')
        .post(authController.login);
    
    app.route('/logout')
        .post(authController.logout);
};
