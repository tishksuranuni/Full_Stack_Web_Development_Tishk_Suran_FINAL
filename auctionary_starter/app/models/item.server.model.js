const db = require('../../database');

const create = (itemData, callback) => {
    const SQL = `
        INSERT INTO items (name, description, starting_bid, start_date, end_date, creator_id) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
        itemData.name,
        itemData.description,
        itemData.starting_bid,
        Date.now(),
        itemData.end_date,
        itemData.creator_id
    ];
    
    db.run(SQL, params, function(error) {
        if (error) {
            return callback(error, null);
        }
        callback(null, { item_id: this.lastID });
    });
};

const findById = (itemId, callback) => {
    const SQL = 'SELECT * FROM items WHERE item_id = ?';
    db.get(SQL, [itemId], (error, row) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, row);
    });
};

const getDetails = (itemId, callback) => {
    const SQL = `
        SELECT 
            items.item_id,
            items.name,
            items.description,
            items.starting_bid, 
            items.start_date,
            items.end_date,
            items.creator_id,
            users.first_name,
            users.last_name
        FROM items
        JOIN users ON items.creator_id = users.user_id
        WHERE items.item_id = ?
    `;
    
    db.get(SQL, [itemId], (error, item) => {
        if (error) {
            return callback(error, null);
        }
        if (!item) {
            return callback(null, null);
        }
        
        const bidSQL = `
            SELECT 
                bids.amount,
                bids.user_id,
                users.first_name,
                users.last_name
            FROM bids
            JOIN users ON bids.user_id = users.user_id
            WHERE bids.item_id = ?
            ORDER BY bids.amount DESC
            LIMIT 1
        `;
        
        db.get(bidSQL, [itemId], (error, highestBid) => {
            if (error) {
                return callback(error, null);
            }
            
            const result = {
                item_id: item.item_id,
                name: item.name,
                description: item.description,
                starting_bid: item.starting_bid,
                start_date: item.start_date,
                end_date: item.end_date,
                creator_id: item.creator_id,
                first_name: item.first_name,
                last_name: item.last_name,
                current_bid: highestBid ? highestBid.amount : item.starting_bid,
                current_bid_holder: highestBid ? {
                    user_id: highestBid.user_id,
                    first_name: highestBid.first_name,
                    last_name: highestBid.last_name
                } : null
            };
            
            callback(null, result);
        });
    });
};

const search = (params, callback) => {
    let SQL = `
        SELECT DISTINCT
            items.item_id,
            items.name,
            items.description,
            items.starting_bid,
            items.end_date,
            items.creator_id,
            users.first_name,
            users.last_name,
            (SELECT MAX(amount) FROM bids WHERE bids.item_id = items.item_id) as current_bid
        FROM items
        JOIN users ON items.creator_id = users.user_id
    `;
    
    const whereConditions = [];
    const sqlParams = [];
    
    if (params.status) {
        if (params.status === 'OPEN') {
            whereConditions.push('items.creator_id = ?');
            sqlParams.push(params.userId);
            whereConditions.push('items.end_date > ?');
            sqlParams.push(Date.now());
        } else if (params.status === 'BID') {
            SQL = `
                SELECT DISTINCT
                    items.item_id,
                    items.name,
                    items.description,
                    items.starting_bid,
                    items.end_date,
                    items.creator_id,
                    users.first_name,
                    users.last_name,
                    (SELECT MAX(amount) FROM bids WHERE bids.item_id = items.item_id) as current_bid
                FROM items
                JOIN users ON items.creator_id = users.user_id
                JOIN bids ON items.item_id = bids.item_id
            `;
            whereConditions.push('bids.user_id = ?');
            sqlParams.push(params.userId);
            whereConditions.push('items.end_date > ?');
            sqlParams.push(Date.now());
        } else if (params.status === 'ARCHIVE') {
            whereConditions.push('items.end_date <= ?');
            sqlParams.push(Date.now());
        }
    } else {
        // When no status filter, show only active auctions
        whereConditions.push('items.end_date > ?');
        sqlParams.push(Date.now());
    }
    
    if (params.q) {
        whereConditions.push('(items.name LIKE ? OR items.description LIKE ?)');
        sqlParams.push(`%${params.q}%`);
        sqlParams.push(`%${params.q}%`);
    }
    
    if (whereConditions.length > 0) {
        SQL += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    SQL += ' ORDER BY items.item_id ASC';
    
    const limit = params.limit || 10;
    const offset = params.offset || 0;
    SQL += ` LIMIT ? OFFSET ?`;
    sqlParams.push(limit);
    sqlParams.push(offset);
    
    db.all(SQL, sqlParams, (error, rows) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, rows || []);
    });
};

module.exports = {
    create,
    findById,
    getDetails,
    search
};