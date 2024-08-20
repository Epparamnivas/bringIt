document.addEventListener('DOMContentLoaded', () => {
    // Function to initialize card event listeners
    function initializeCardEventListeners() {
        const cardTitles = document.querySelectorAll('.card-title');
        const deleteCardButtons = document.querySelectorAll('.delete-card');
        const cards = document.querySelectorAll('.card');

        // Handle card clicking to toggle details
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const cardContent = card.querySelector('.card-content');
                if (cardContent) {
                    cardContent.classList.toggle('active');
                }
            });
        });

        // Enable editing on click for card titles
        cardTitles.forEach(cardTitle => {
            cardTitle.addEventListener('click', () => {
                cardTitle.readOnly = false;
                cardTitle.focus();
            });

            cardTitle.addEventListener('blur', () => {
                const cardId = cardTitle.closest('.card').dataset.cardId;
                let newName = cardTitle.value.trim();

                if (!newName) {
                    alert('Card title cannot be empty');
                    cardTitle.value = cardTitle.dataset.originalName || 'Untitled Card';
                    cardTitle.readOnly = true;
                    return;
                }

                cardTitle.dataset.originalName = newName;

                fetch(`/api/cards/${cardId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ card_name: newName })
                }).then(response => response.json())
                  .then(data => {
                    if (data.success) {
                        cardTitle.readOnly = true;
                    } else {
                        alert('Failed to update card');
                        cardTitle.value = cardTitle.dataset.originalName;
                        cardTitle.readOnly = true;
                    }
                }).catch(error => {
                    console.error('Error:', error);
                    alert('Failed to update card');
                    cardTitle.value = cardTitle.dataset.originalName;
                    cardTitle.readOnly = true;
                });
            });

            cardTitle.addEventListener('focus', () => {
                cardTitle.dataset.originalName = cardTitle.value;
            });
        });

        // Handle delete card functionality
        deleteCardButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevents card click event from triggering
                const card = button.closest('.card');
                const cardId = card.dataset.cardId;

                fetch(`/api/cards/${cardId}`, {
                    method: 'DELETE'
                }).then(response => response.json())
                  .then(data => {
                    if (data.success) {
                        card.remove();
                    }
                }).catch(error => {
                    console.error('Error:', error);
                    alert('Failed to delete card');
                });
            });
        });
    }

    // Handle Add New Card functionality
    function showAddCardForm() {
        const formHtml = `
            <div class="card-form">
                <input type="text" id="new-card-title" placeholder="Card Title">
                <button id="submit-card">Submit</button>
                <button id="cancel-card">Cancel</button>
            </div>
        `;

        document.querySelector('.cards').insertAdjacentHTML('afterbegin', formHtml);

        document.querySelector('#submit-card').addEventListener('click', addCard);
        document.querySelector('#cancel-card').addEventListener('click', () => {
            document.querySelector('.card-form').remove();
        });
    }

    function addCard() {
        const title = document.querySelector('#new-card-title').value;

        if (title) {
            fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ card_name: title })
            }).then(response => response.json())
              .then(data => {
                if (data.success) {
                    const cardHtml = `
                        <div class="card" data-card-id="${data.cardId}">
                            <div class="card-header">
                                <input type="text" class="card-title" value="${title}" readonly>
                                <div class="card-options">
                                    <button class="delete-card">Delete</button>
                                </div>
                            </div>
                            <div class="card-content hidden">
                                <table class="card-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Where</th>
                                            <th>Quantity</th>
                                            <th>Suggestions</th>
                                        </tr>
                                    </thead>
                                    <tbody class="card-items">
                                        <!-- Items will be inserted here -->
                                    </tbody>
                                </table>
                                <div class="add-item-form">
                                    <input type="text" id="item-name" placeholder="Item Name">
                                    <input type="text" id="item-location" placeholder="Location">
                                    <input type="number" id="item-quantity" placeholder="Quantity">
                                    <input type="text" id="item-suggestions" placeholder="Suggestions">
                                    <button id="submit-item">Add Item</button>
                                </div>
                            </div>
                        </div>
                    `;

                    document.querySelector('.cards').insertAdjacentHTML('afterbegin', cardHtml);
                    document.querySelector('.card-form').remove();

                    initializeCardEventListeners();
                } else {
                    alert('Failed to add card');
                }
            }).catch(error => {
                console.error('Error:', error);
                alert('Failed to add card');
            });
        } else {
            alert('Card title cannot be empty');
        }
    }

    initializeCardEventListeners();

    document.querySelector('.add-card-btn').addEventListener('click', showAddCardForm);
});
