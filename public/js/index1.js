// scripts.js
document.getElementById('signup-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevents the default form submission

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Example of how you might send data to the server
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    })
    .then(response => response.json())
    .then(data => {
        alert('Registration successful!');
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
