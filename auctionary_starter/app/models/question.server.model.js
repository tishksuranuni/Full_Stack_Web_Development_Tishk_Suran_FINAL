const db = require('../../database');

const create = (questionData, callback) => {
    const sql = `INSERT INTO questions (question, asked_by, item_id)
                 VALUES (?, ?, ?)`;
    
    const params = [
        questionData.question_text,
        questionData.asked_by,
        questionData.item_id
    ];

    db.run(sql, params, function(error) {
        
        if(error) {
            return callback(error, null);
        }

        callback(null, { question_id: this.lastID })
    });
};

const findById = (questionId, callback) => {
    const sql = `
        SELECT questions.question_id,
        questions.question,
        questions.answer,
        questions.asked_by,
        questions.item_id,
        items.creator_id
        FROM questions
        JOIN items ON questions.item_id = items.item_id
        WHERE questions.question_id = ?
    `;

    db.get(sql, [questionId], (error, row) => {
        
        if (error) {
            return callback(error, null);
        }
        
        callback(null, row);
    });
};

const answer = (questionId, answerText, callback) => {
    const SQL = 'UPDATE questions SET answer = ? WHERE question_id = ?';

    db.run(SQL, [answerText, questionId], function(error) {

        if(error) {
            return callback(error, false);
        }

        callback(null, this.changes > 0);
    });
};

const getByItemId = (itemId, callback) => {
    const SQL =
            `SELECT question_id,
                question AS question_text,
                answer AS answer_text
            FROM questions
            WHERE item_id = ?
            ORDER BY question_id DESC;
        `;

    db.all(SQL, [itemId], (error, rows) => {

        if(error) {
            return callback(error, null);
        }

        callback(null, rows || []);
    });
};

module.exports = {
    create, 
    findById, 
    answer, 
    getByItemId
};