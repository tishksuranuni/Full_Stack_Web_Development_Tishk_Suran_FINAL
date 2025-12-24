/**
 * Category Model
 *
 * EXTENSION TASK 2: Categories System
 *
 * This model manages the categories system which allows:
 * - Each item to be associated with multiple categories (many-to-many relationship)
 * - Filtering/searching items by category
 * - Retrieving all available categories
 *
 * Database Schema:
 * ---------------
 * 1. categories table:
 *    - category_id (PRIMARY KEY)
 *    - name (UNIQUE, NOT NULL)
 *    - description
 *
 * 2. item_categories table (junction table):
 *    - item_id (FOREIGN KEY -> items.item_id)
 *    - category_id (FOREIGN KEY -> categories.category_id)
 *    - PRIMARY KEY (item_id, category_id) - ensures unique pairs
 *
 * How it works:
 * ------------
 * - The junction table creates a many-to-many relationship between items and categories
 * - One item can belong to multiple categories (e.g., "Vintage Watch" can be in both "Collectibles" and "Fashion")
 * - One category can contain multiple items
 * - When an item is deleted, CASCADE removes its category associations automatically
 */

const db = require('../../database');

/**
 * Get all categories
 *
 * Returns all available categories sorted alphabetically by name
 * Used by frontend to display category options in dropdowns/filters
 *
 * @param {Function} callback - callback(error, categories)
 * @returns {Array} Array of category objects: [{category_id, name, description}, ...]
 */
const getAll = (callback) => {
    const SQL = 'SELECT category_id, name, description FROM categories ORDER BY name ASC';

    db.all(SQL, [], (error, rows) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, rows || []);
    });
};

/**
 * Get a single category by ID
 *
 * Retrieves details of a specific category
 *
 * @param {number} categoryId - The category ID to fetch
 * @param {Function} callback - callback(error, category)
 * @returns {Object} Category object: {category_id, name, description}
 */
const findById = (categoryId, callback) => {
    const SQL = 'SELECT category_id, name, description FROM categories WHERE category_id = ?';

    db.get(SQL, [categoryId], (error, row) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, row);
    });
};

/**
 * Add categories to an item (many-to-many association)
 *
 * This function:
 * 1. First DELETES all existing category associations for the item
 * 2. Then INSERTS new category associations
 *
 * This "delete then insert" approach ensures clean updates when editing an item's categories
 *
 * Example usage:
 * addToItem(123, [1, 5, 7], callback)  // Associate item 123 with categories 1, 5, and 7
 *
 * @param {number} itemId - The item to associate categories with
 * @param {Array<number>} categoryIds - Array of category IDs [1, 2, 3, ...]
 * @param {Function} callback - callback(error)
 */
const addToItem = (itemId, categoryIds, callback) => {
    // If no categories provided, just return success
    if (!categoryIds || categoryIds.length === 0) {
        return callback(null);
    }

    // STEP 1: Remove existing category associations for this item
    // This ensures we don't have duplicate entries when updating
    const deleteSQL = 'DELETE FROM item_categories WHERE item_id = ?';

    db.run(deleteSQL, [itemId], (error) => {
        if (error) {
            return callback(error);
        }

        // STEP 2: Insert new category associations
        // We use a prepared statement for efficiency (single compilation, multiple executions)
        const insertSQL = 'INSERT INTO item_categories (item_id, category_id) VALUES (?, ?)';
        const stmt = db.prepare(insertSQL);

        // Track completion to know when all inserts are done
        let completed = 0;
        let hasError = false;

        // Insert each category association
        categoryIds.forEach((categoryId) => {
            stmt.run([itemId, categoryId], (err) => {
                // If an error occurs, finalize immediately and callback
                if (err && !hasError) {
                    hasError = true;
                    stmt.finalize();
                    return callback(err);
                }

                // Track progress
                completed++;

                // When all inserts complete successfully, finalize and callback
                if (completed === categoryIds.length && !hasError) {
                    stmt.finalize();
                    callback(null);
                }
            });
        });
    });
};

/**
 * Get all categories associated with an item
 *
 * Uses a JOIN to fetch category details for a specific item
 *
 * SQL Explanation:
 * - JOINs categories table with item_categories junction table
 * - Filters by item_id to get only categories for this specific item
 * - Returns full category details (not just IDs)
 *
 * Example result:
 * [
 *   {category_id: 1, name: "Electronics", description: "Electronic devices..."},
 *   {category_id: 5, name: "Collectibles", description: "Rare items..."}
 * ]
 *
 * @param {number} itemId - The item to get categories for
 * @param {Function} callback - callback(error, categories)
 * @returns {Array} Array of category objects for this item
 */
const getByItem = (itemId, callback) => {
    const SQL = `
        SELECT c.category_id, c.name, c.description
        FROM categories c
        JOIN item_categories ic ON c.category_id = ic.category_id
        WHERE ic.item_id = ?
        ORDER BY c.name ASC
    `;

    db.all(SQL, [itemId], (error, rows) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, rows || []);
    });
};

module.exports = {
    getAll,
    findById,
    addToItem,
    getByItem
};
