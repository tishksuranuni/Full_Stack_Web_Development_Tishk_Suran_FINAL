const db = require('../../database')

const create = (userData, callback) => {

    const sql = `INSERT INTO users (first_name, last_name, email, password, salt)
                 VALUES (?, ?, ?, ? ,? )`;

    const params = [
        userData.first_name,
        userData.last_name,
        userData.email,
        userData.password,
        userData.salt
    ];

    db.run(sql, params, function(error) {

        if(error) {
            return callback(error, null);
        }
        callback(null, { user_id: this.lastID });
    });
};

const findByEmail = (email, callback) => {
    const sql = `SELECT * FROM users WHERE email = ?`
    db.get(sql, [email], (error, row) => {

        if(error) {
            return callback(error, null);
        }
        callback(null, row);
    });
};

const findById = (userId, callback) => {
    const sql = 'SELECT user_id, first_name, last_name, email FROM users WHERE user_id = ?';

    db.get(sql, [userId], (error, row) => {
        if(error) {
            return callback(error, null);
        }

        callback(null, row);
    });
};

const updateSessionToken = (userId, sessionToken, callback) => {
    const sql = 'UPDATE users SET session_token = ? WHERE user_id = ?';

    db.run(sql, [sessionToken, userId], function(error) {
        if (error) {
            return callback(error);
        }
        callback(null);
    });
};

const findBySessionToken = (sessionToken, callback) => {
    const sql = 'SELECT user_id FROM users WHERE session_token = ?'

    db.get(sql, [sessionToken], (error, row) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, row);
    });
};

const clearSessionToken = (sessionToken, callback) => {
    const sql = 'UPDATE users SET session_token = NULL WHERE session_token = ?';
    db.run(sql, [sessionToken], function(err) {
        if (err) {
            return callback(err, false);
        }
        callback(null, this.changes > 0);
    });
};

const getProfile = (userId, callback) => {
    const userSQL = 'SELECT user_id, first_name, last_name FROM users WHERE user_id = ?';

    db.get(userSQL, [userId], (error, user) => {
        if(error) {
            return callback(error, null);
        }
        if(!user) {
            return callback(null, null);
        }

        const sellingSQL = `
            SELECT items.item_id,
                items.name,
                items.description,
                items.end_date,
                items.creator_id,
                users.first_name,
                users.last_name
            FROM items
            JOIN users ON items.creator_id = users.user_id
            WHERE items.creator_id = ? AND items.end_date > ?
        `;

        db.all(sellingSQL, [userId, Date.now()], (error, selling) => {
            if (error) {
                return callback(error, null);
            }

            const biddingSQL = `
                SELECT DISTINCT
                    items.item_id,
                    items.name,
                    items.description,
                    items.end_date,
                    items.creator_id,
                    users.first_name,
                    users.last_name
                FROM items
                JOIN users ON items.creator_id = users.user_id
                JOIN bids ON items.item_id = bids.item_id
                WHERE bids.user_id = ? AND items.end_date > ?
            `;

            db.all(biddingSQL, [userId, Date.now()], (error, biddingOn) => {
                if(error) {
                    return callback(error, null);
                }

                const endedSQL = `
                    SELECT DISTINCT
                        items.item_id,
                        items.name,
                        items.description,
                        items.end_date,
                        items.creator_id,
                        users.first_name,
                        users.last_name
                    FROM items
                    JOIN users ON items.creator_id = users.user_id
                    LEFT JOIN bids ON items.item_id = bids.item_id
                    WHERE items.end_date <= ?
                    AND (items.creator_id = ? OR bids.user_id = ?)
                    `;

                db.all(endedSQL, [Date.now(), userId, userId], (error, auctionsEnded) => {
                    if (error) {
                        return callback(error, null);
                    }

                    callback(null, {
                        user_id: user.user_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        selling: selling || [],
                        bidding_on: biddingOn || [],
                        auctions_ended: auctionsEnded || []
                    });
                });
            });
        });
    });
};

module.exports = {
    create,
    findByEmail,
    findById,
    updateSessionToken,
    findBySessionToken,
    clearSessionToken,
    getProfile
};