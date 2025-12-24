const itemModel = require('../models/item.server.model');
const categoryModel = require('../models/category.server.model');
const { itemCreateSchema, validate } = require('../validators/validators');
const { validateFields } = require('../lib/profanityFilter');

const create = (req, res) => {
    const validation = validate(itemCreateSchema, req.body);
    if (!validation.valid) {
        return res.status(400).json({ error_message: validation.error });
    }
    
    const allowedFields = ['name', 'description', 'starting_bid', 'end_date', 'categories'];
    const bodyFields = Object.keys(req.body);
    const hasExtraFields = bodyFields.some(field => !allowedFields.includes(field));
    if (hasExtraFields) {
        return res.status(400).json({ error_message: 'Extra fields not allowed!' });
    }
    
    let endDate = req.body.end_date;
    if (typeof endDate === 'string') {
        endDate = parseInt(endDate, 10);
    }
    
    if (endDate <= Date.now()) {
        return res.status(400).json({ error_message: 'End date must be in the future!' });
    }

    // Check for profanity in name and description
    const profanityCheck = validateFields({
        name: req.body.name,
        description: req.body.description
    });

    if (!profanityCheck.valid) {
        return res.status(400).json({
            error_message: `Inappropriate language detected in ${profanityCheck.field}!`
        });
    }

    const itemData = {
        name: req.body.name,
        description: req.body.description,
        starting_bid: req.body.starting_bid,
        end_date: endDate,
        creator_id: req.userId
    };
    
    itemModel.create(itemData, (error, result) => {
        if (error) {
            return res.status(500).json({ error_message: 'Internal server error!' });
        }

        // Extension Task 2: Add categories if provided
        const categories = req.body.categories;
        if (categories && Array.isArray(categories) && categories.length > 0) {
            categoryModel.addToItem(result.item_id, categories, (catError) => {
                if (catError) {
                    // Item created but categories failed - return success anyway
                    console.error('Failed to add categories:', catError);
                }
                res.status(201).json({ item_id: result.item_id });
            });
        } else {
            res.status(201).json({ item_id: result.item_id });
        }
    });
};


const getOne = (req, res) => {
    const itemId = parseInt(req.params.item_id, 10);
    
    if (isNaN(itemId)) {
        return res.status(404).json({ error_message: 'Item not found!' });
    }
    
    itemModel.getDetails(itemId, (error, item) => {
        if (error) {
            return res.status(500).json({ error_message: 'Internal server error!' });
        }

        if (!item) {
            return res.status(404).json({ error_message: 'Item not found!' });
        }

        // Extension Task 2: Get categories for the item
        categoryModel.getByItem(itemId, (catError, categories) => {
            if (catError) {
                // Return item without categories if fetch fails
                console.error('Failed to fetch categories:', catError);
                return res.status(200).json(item);
            }

            item.categories = categories || [];
            res.status(200).json(item);
        });
    });
};


const search = (req, res) => {
    const status = req.query.status;
    const q = req.query.q;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
    const category = req.query.category ? parseInt(req.query.category, 10) : null;

    if (status && !['OPEN', 'BID', 'ARCHIVE'].includes(status)) {
        return res.status(400).json({ error_message: 'Invalid status!' });
    }

    if ((status === 'OPEN' || status === 'BID') && !req.userId) {
        return res.status(400).json({ error_message: 'Authentication required for this status!' });
    }

    const params = {
        status: status,
        q: q,
        limit: limit,
        offset: offset,
        userId: req.userId,
        category: category  // Extension Task 2: Category filter
    };
    
    itemModel.search(params, (error, items) => {
        if (error) {
            return res.status(500).json({ error_message: 'Internal server error!' });
        }
        
        res.status(200).json(items);
    });
};

module.exports = {
    create,
    getOne,
    search
};
