const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path to your database module as needed

// Middleware to check if user is authenticated
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login page if session is not valid
    }
    next();
};

// Route to update a card
router.post('/updateCard', checkAuth, (req, res) => {
    const cardId = req.body.card_id;
    const cardName = req.body.card_name;

    console.log('Updating card:', { cardId, cardName });

    // Ensure card_name is not null or empty
    if (!cardName) {
        return res.status(400).json({ success: false, message: 'Card name cannot be empty' });
    }

    db.query('UPDATE Cards SET card_name = ? WHERE card_id = ?', [cardName, cardId], (err, results) => {
        if (err) {
            console.error('Error updating card:', err);
            return res.status(500).json({ success: false, message: 'Failed to update card' });
        }
        res.json({ success: true, message: 'Card updated successfully' });
    });
});

// Route to get the home page
router.get('/home', checkAuth, (req, res) => {
    console.log('Session data:', req.session); // Log session data
    const userId = req.session.user ? req.session.user.user_id : null;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User is not authenticated' });
    }

    // Fetch cards for the logged-in user
    db.query('SELECT card_id, card_name FROM Cards WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching cards:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch cards' });
        }
        res.render('home', { cards: results });
    });
});

// Route to handle logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/home');
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/login'); // Redirect to login page after logout
    });
});

module.exports = router;
