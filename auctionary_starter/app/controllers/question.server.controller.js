const questionModel = require('../models/question.server.model');
const itemModel = require('../models/item.server.model');

const { questionCreateSchema, answerCreateSchema, validate } = require('../validators/validators');
const { validateFields } = require('../lib/profanityFilter');

const create = (req, res) => {
    const itemId = parseInt(req.params.item_id, 10);

    if (isNaN(itemId)) {
        return res.status(404).json({ error_message: 'Item not found!' });
    }

    const validation = validate(questionCreateSchema, req.body);
    if (!validation.valid) {
        return res.status(400).json({ error_message: validation.error });
    }

    const allowedFields = ['question_text'];
    const bodyFields = Object.keys(req.body);
    const hasExtraFields = bodyFields.some(field => !allowedFields.includes(field));
    if (hasExtraFields) {
        return res.status(400).json({ error_message: 'Extra fields not allowed, what are you trying to do? :/ ' });
    }

    itemModel.findById(itemId, (error, item) => {
        if (error) {
            return res.status(500).json({ error_message: 'Internal server error!' });
        }
        
        if (!item) {
            return res.status(404).json({ error_message: 'Item not found!' });
        }
        
        if (item.creator_id === req.userId) {
            return res.status(403).json({ error_message: 'Cannot ask question on your own item, surely you should already know the answer?!' });
        }

        // Check for profanity in question text
        const profanityCheck = validateFields({
            question_text: req.body.question_text
        });

        if (!profanityCheck.valid) {
            return res.status(400).json({
                error_message: 'Inappropriate language detected in question!'
            });
        }

        const questionData = {
            question_text: req.body.question_text,
            asked_by: req.userId,
            item_id: itemId
        };

        questionModel.create(questionData, (error, result) => {
            if (error) {
                return res.status(500).json({ error_message: 'Internal server error!' });
            }
            
            res.status(200).json({ question_id: result.question_id });
        });
    });
};

const answer = (req, res) => {
    const questionId = parseInt(req.params.question_id, 10);
    
    if (isNaN(questionId)) {
        return res.status(404).json({ error_message: 'Question not found!' });
    }
    
    const validation = validate(answerCreateSchema, req.body);
    if (!validation.valid) {
        return res.status(400).json({ error_message: validation.error });
    }
    
    const allowedFields = ['answer_text'];
    const bodyFields = Object.keys(req.body);
    const hasExtraFields = bodyFields.some(field => !allowedFields.includes(field));
    if (hasExtraFields) {
        return res.status(400).json({ error_message: 'Extra fields not allowed!' });
    }
    
    questionModel.findById(questionId, (error, question) => {
        if (error) {
            return res.status(500).json({ error_message: 'Internal server error!' });
        }
        
        if (!question) {
            return res.status(404).json({ error_message: 'Question not found!' });
        }
        
        if (question.creator_id !== req.userId) {
            return res.status(403).json({ error_message: 'Only the item creator can answer questions, do not try to speak on their behalf!' });
        }

        // Check for profanity in answer text
        const profanityCheck = validateFields({
            answer_text: req.body.answer_text
        });

        if (!profanityCheck.valid) {
            return res.status(400).json({
                error_message: 'Inappropriate language detected in answer!'
            });
        }

        questionModel.answer(questionId, req.body.answer_text, (error) => {
            if (error) {
                return res.status(500).json({ error_message: 'Internal server error!' });
            }

            res.status(200).json({ message: 'Answer added successfully!' });
        });
    });
};

const getByItem = (req, res) => {
    const itemId = parseInt(req.params.item_id, 10);
    
    if (isNaN(itemId)) {
        return res.status(404).json({ error_message: 'Item not found!' });
    }
    
    itemModel.findById(itemId, (error, item) => {
        if (error) {
            return res.status(500).json({ error_message: 'Internal server error!' });
        }
        
        if (!item) {
            return res.status(404).json({ error_message: 'Item not found!' });
        }
        
        questionModel.getByItemId(itemId, (error, questions) => {
            if (error) {
                return res.status(500).json({ error_message: 'Internal server error!' });
            }
            
            res.status(200).json(questions);
        });
    });
};

module.exports = {
    create,
    answer,
    getByItem
};
