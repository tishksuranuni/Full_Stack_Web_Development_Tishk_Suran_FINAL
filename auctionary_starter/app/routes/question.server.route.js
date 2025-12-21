const questionController = require('../controllers/question.server.controller');

const { isAuthenticated } = require('../middleware/auth.middleware');

module.exports = function(app) {
    app.route('/item/:item_id/question')
        .get(questionController.getByItem)
        .post(isAuthenticated, questionController.create);
    
    app.route('/question/:question_id')
        .post(isAuthenticated, questionController.answer);
};
