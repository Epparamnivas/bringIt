const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path according to your project structure

// Route to add an item to a card
router.post('/:cardId/items', (req, res) => {
    const cardId = req.params.cardId;
    const { item_name, item_location, item_quantity, item_suggestions } = req.body;

    if (!item_name || !item_location || !item_quantity) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const query = 'INSERT INTO card_items (card_id, item_name, item_location, item_quantity, item_suggestions) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [cardId, item_name, item_location, item_quantity, item_suggestions], (error, results) => {
        if (error) {
            console.error('Error:', error);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true });
    });
});

module.exports = router;
