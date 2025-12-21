const bidModel = require('../models/bid.server.model');
const itemModel = require('../models/item.server.model');

const { bidCreateSchema, validate } = require('../validators/validators');


const create = (req, res) => {
    const itemId = parseInt(req.params.item_id, 10);
    
    if (isNaN(itemId)) {
        return res.status(404).json({ error_message: 'Item not found!' });
    }
    
    const validation = validate(bidCreateSchema, req.body);
    if (!validation.valid) {
        return res.status(400).json({ error_message: validation.error });
    }
    
    const allowedFields = ['amount'];
    const bodyFields = Object.keys(req.body);
    const hasExtraFields = bodyFields.some(field => !allowedFields.includes(field));
    if (hasExtraFields) {
        return res.status(400).json({ error_message: 'Extra fields not allowed!' });
    }
    
    itemModel.findById(itemId, (error, item) => {
        if (error) {
            return res.status(500).json({ error_message: 'Internal server error!' });
        }
        
        if (!item) {
            return res.status(404).json({ error_message: 'Item not found!' });
        }
        
        if (item.creator_id === req.userId) {
            return res.status(403).json({ error_message: 'Cannot bid on your own item, why would you do this?' });
        }
        
        bidModel.getHighestBid(itemId, (error, highestBid) => {
            if (error) {
                return res.status(500).json({ error_message: 'Internal server error!' });
            }
            
            const currentBid = highestBid || item.starting_bid;
            
            if (req.body.amount <= currentBid) {
                return res.status(400).json({ error_message: 'Bid must be higher than current bid, duh!' });
            }
            
            const bidData = {
                item_id: itemId,
                user_id: req.userId,
                amount: req.body.amount
            };
            
            bidModel.create(bidData, (error, result) => {
                if (error) {
                    return res.status(500).json({ error_message: 'Internal server error' });
                }
                
                res.status(201).json({ message: 'Bid placed successfully' });
            });
        });
    });
};


const getHistory = (req, res) => {
    const itemId = parseInt(req.params.item_id, 10);
    
    if (isNaN(itemId)) {
        return res.status(404).json({ error_message: 'Item not found' });
    }
    
    itemModel.findById(itemId, (error, item) => {
        if (error) {
            return res.status(500).json({ error_message: 'Internal server error' });
        }
        
        if (!item) {
            return res.status(404).json({ error_message: 'Item not found' });
        }
        
        bidModel.getHistory(itemId, (error, bids) => {
            if (error) {
                return res.status(500).json({ error_message: 'Internal server error' });
            }
            
            res.status(200).json(bids);
        });
    });
};

module.exports = {
    create,
    getHistory
};
