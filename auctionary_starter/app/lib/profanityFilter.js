const leoProfanity = require('leo-profanity');

/**
 * Check if text contains profanity
 * @param {string} text - Text to check
 * @returns {boolean} - True if profanity detected
 */
const containsProfanity = (text) => {
    if (!text || typeof text !== 'string') {
        return false;
    }
    return leoProfanity.check(text);
};

/**
 * Clean profanity from text by replacing with asterisks
 * @param {string} text - Text to clean
 * @returns {string} - Cleaned text
 */
const cleanProfanity = (text) => {
    if (!text || typeof text !== 'string') {
        return text;
    }
    return leoProfanity.clean(text);
};

/**
 * Validate multiple fields for profanity
 * @param {Object} fields - Object with field names as keys and text as values
 * @returns {Object} - { valid: boolean, field: string|null }
 */
const validateFields = (fields) => {
    for (const [fieldName, value] of Object.entries(fields)) {
        if (containsProfanity(value)) {
            return {
                valid: false,
                field: fieldName
            };
        }
    }
    return { valid: true, field: null };
};

module.exports = {
    containsProfanity,
    cleanProfanity,
    validateFields
};
