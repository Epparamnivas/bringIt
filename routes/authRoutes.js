const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db'); // Adjust path as necessary

// Registration route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO Users (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error inserting user into database:', err);
                return res.redirect('/signupPage'); // Redirect with error message
            }
            req.session.user = { user_id: result.insertId, username, email };
            res.redirect('/home'); // Redirect to home page
        });
    } catch (err) {
        console.error('Error hashing password:', err);
        res.redirect('/signupPage'); // Redirect with error message
    }
});

// Login route

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Query the database to find the user by email
    db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Internal server error');
        }

        if (results.length === 0) {
            console.log('Login attempt:', req.body);
            return res.status(400).send('No user found with this email.');
        }

        const user = results[0];

        // Compare the provided password with the stored hashed password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                console.error('Password comparison error:', err);
                return res.status(500).send('Internal server error');
            }

            if (isMatch) {
                // Passwords match, create session and log the user in
                req.session.user = user;
                res.redirect('/home');
            } else {
                res.status(400).send('Invalid credentials.');
            }
        });
    });
});


module.exports = router;
