const db = require('../../database');

const create = (bidData, callback) => {
    const SQL = `INSERT INTO bids (item_id, user_id, amount, timestamp)
                 VALUES (?, ?, ?, ?)`;
    
    const params = [
        bidData.item_id,
        bidData.user_id,
        bidData.amount,
        Date.now()
    ];

    db.run(SQL, params, function(error) {

        if (error) {
            return callback(error, null);
        }

        callback(null, { success: true });
    });
};

const getHighestBid = (itemId, callback) => {
    const SQL = `
        SELECT amount FROM bids
        WHERE item_id = ?
        ORDER BY amount DESC
        LIMIT 1
        `;
    
        db.get(SQL, [itemId], (error, row) => {

            if(error) {
                return callback(error, null);
            }

            callback(null, row ? row.amount : null);
    });
};

const getHistory = (itemId, callback) => {
    const SQL = `
        SELECT bids.item_id,
            bids.user_id,
            bids.amount,
            bids.timestamp,
            users.first_name,
            users.last_name
        FROM bids
        JOIN users ON bids.user_id = users.user_id
        WHERE bids.item_id = ?
        ORDER BY bids.amount DESC;
        `;

    db.all(SQL, [itemId], (error, rows) => {
        if (error) {
            return callback(error, null);
        }

        callback(null, rows || []);
    });
};

module.exports = {
    create,
    getHighestBid,
    getHistory
};