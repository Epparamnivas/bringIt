const bcrypt = require('bcrypt');
const db = require('../db');

// Helper function to check if a username already exists
const checkUsernameExists = (username, callback) => {
    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results.length > 0);
        }
    });
};

// User registration handler
exports.register = (req, res) => {
    const { username, email, password } = req.body;

    checkUsernameExists(username, (err, exists) => {
        if (err) {
            console.error('Error checking username existence:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (exists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }

            // Insert new user
            const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
            db.query(sql, [username, email, hash], (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                res.status(201).json({ message: 'User registered successfully' });
            });
        });
    });
};

// User login handler
exports.login = (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Error querying user:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.length > 0) {
            bcrypt.compare(password, results[0].password, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                if (isMatch) {
                    req.session.user = results[0];
                    res.json({ message: 'Logged in successfully' });
                } else {
                    res.status(401).json({ message: 'Incorrect password' });
                }
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
};
