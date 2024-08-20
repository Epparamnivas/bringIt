const express = require('express');
const router = express.Router();
const db = require('../db'); // Make sure to configure your DB connection properly

// Middleware to parse JSON
router.use(express.json());


// Route to add a new card
router.post('/cards', (req, res) => {
    console.log('Session data:', req.session); // Log session data
    console.log('Request body:', req.body); // Log request body

    const { card_name } = req.body;
    const userId = req.session.user ? req.session.user.user_id : null;

    if (!card_name) {
        return res.status(400).json({ success: false, message: 'Card name is required' });
    }

    if (!userId) {
        return res.status(401).json({ success: false, message: 'User is not authenticated' });
    }

    db.query('INSERT INTO cards (card_name, user_id) VALUES (?, ?)', [card_name, userId], (err, results) => {
        if (err) {
            console.error('Error adding card:', err);
            return res.status(500).json({ success: false, message: 'Failed to add card' });
        }
        res.json({ success: true, cardId: results.insertId });
    });
});





// Update a card's name
router.put('/cards/:id', (req, res) => {
    const cardId = req.params.id;
    const { card_name } = req.body; // Updated to card_name
    const query = 'UPDATE cards SET card_name = ? WHERE card_id = ?'; // Updated column names

    db.query(query, [card_name, cardId], (err, results) => {
        if (err) {
            console.error('Error updating card:', err);
            return res.status(500).json({ success: false, message: 'Failed to update card' });
        }
        res.status(200).json({ success: true });
    });
});

// Delete a card
router.delete('/cards/:id', (req, res) => {
    const cardId = req.params.id;

    // First delete all items associated with this card
    db.query('DELETE FROM items WHERE card_id = ?', [cardId], (err) => {
        if (err) {
            console.error('Error deleting items:', err);
            return res.status(500).json({ success: false, message: 'Failed to delete items' });
        }

        // Then delete the card itself
        db.query('DELETE FROM cards WHERE card_id = ?', [cardId], (err) => { // Updated column name
            if (err) {
                console.error('Error deleting card:', err);
                return res.status(500).json({ success: false, message: 'Failed to delete card' });
            }
            res.status(200).json({ success: true });
        });
    });
});

// Get all items for a specific card (used in "Show More" functionality)
router.get('/cards/:id/items', (req, res) => {
    const cardId = req.params.id;
    const query = 'SELECT * FROM items WHERE card_id = ?';

    db.query(query, [cardId], (err, results) => {
        if (err) {
            console.error('Error retrieving items:', err);
            return res.status(500).json({ success: false, message: 'Failed to retrieve items' });
        }
        res.status(200).json({ items: results });
    });
});


module.exports = router;
