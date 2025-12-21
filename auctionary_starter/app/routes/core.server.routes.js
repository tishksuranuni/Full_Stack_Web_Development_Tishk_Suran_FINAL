const itemController = require('../controllers/item.server.controller');
const bidController = require('../controllers/bid.server.controller');

const { isAuthenticated, optionalAuth } = require('../middleware/auth.middleware');

module.exports = function(app) {
    app.route('/item')
        .post(isAuthenticated, itemController.create);
    
    app.route('/item/:item_id')
        .get(itemController.getOne);
    
    app.route('/item/:item_id/bid')
        .get(bidController.getHistory)
        .post(isAuthenticated, bidController.create);
    
    app.route('/search')
        .get(optionalAuth, itemController.search);
};
