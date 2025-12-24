const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = 'db.sqlite';

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if(err){
        console.log(err.message);
        throw err;
    }else{
        console.log('Connected to the SQLite database.')

        db.run(`CREATE TABLE users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name text,
                last_name text,
                email text UNIQUE,
                password text,
                salt text,
                session_token text,
                CONSTRAINT email_unique UNIQUE (email)
            )`, (err) => {
                if(err){
                    console.log('Users table already created');
                }else{
                    console.log('Users table created');
                }
            }
        );

        
        db.run(`CREATE TABLE items (
                item_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                description TEXT,
                starting_bid INTEGER,
                start_date INTEGER,
                end_date INTEGER,
                creator_id INTEGER,
                FOREIGN KEY(creator_id) REFERENCES users(user_id)
            )`, (err) => {
                if(err){
                    console.log('Items table already created');
                }else{
                    console.log('Items table created');
                }
            }
        );

        db.run(`CREATE TABLE bids (
                item_id INTEGER,
                user_id INTEGER,
                amount INTEGER,
                timestamp INTEGER,
                PRIMARY KEY (item_id, user_id, amount),
                FOREIGN KEY (item_id) REFERENCES items(item_id),
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )`, (err) => {
                if(err){
                    // console.log(err)
                    console.log('Bid table already created');
                }else{
                    console.log('Bid table created');
                }
            }
        );

        db.run(`CREATE TABLE questions (
                question_id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT,
                answer TEXT,
                asked_by INTEGER,
                item_id INTEGER,
                FOREIGN KEY (asked_by) REFERENCES users(user_id),
                FOREIGN KEY (item_id) REFERENCES items(item_id)
            )`, (err) => {
                if(err){
                    console.log('Questions table already created');
                }else{
                    console.log('Questions table created');
                }
            }
        );

        // Extension Task 2: Categories table
        db.run(`CREATE TABLE categories (
                category_id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT
            )`, (err) => {
                if(err){
                    console.log('Categories table already created');
                }else{
                    console.log('Categories table created');

                const defaultCategories = [
                    ['Alkali Metals', 'Highly reactive metals in Group 1 of the periodic table'],
                    ['Alkaline Earth Metals', 'Reactive metals in Group 2 of the periodic table'],
                    ['Transition Metals', 'Metals in Groups 3–12 with variable oxidation states'],
                    ['Post-Transition Metals', 'Metals with lower melting points and higher electronegativity'],
                    ['Metalloids', 'Elements with properties of both metals and nonmetals'],
                    ['Nonmetals', 'Elements that lack metallic characteristics'],
                    ['Halogens', 'Highly reactive nonmetals in Group 17'],
                    ['Noble Gases', 'Inert gases with full valence electron shells'],
                    ['Lanthanides', 'Rare earth elements with atomic numbers 57–71'],
                    ['Actinides', 'Radioactive elements with atomic numbers 89–103']
                ];


                    const stmt = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)');
                    defaultCategories.forEach(cat => {
                        stmt.run(cat[0], cat[1]);
                    });
                    stmt.finalize();
                }
            }
        );

        // Extension Task 2: Item-Categories junction table for many-to-many relationship
        db.run(`CREATE TABLE item_categories (
                item_id INTEGER,
                category_id INTEGER,
                PRIMARY KEY (item_id, category_id),
                FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
                FOREIGN KEY (category_id) REFERENCES categories(category_id)
            )`, (err) => {
                if(err){
                    console.log('Item_categories table already created');
                }else{
                    console.log('Item_categories table created');
                }
            }
        );
    }
});

module.exports = db;
