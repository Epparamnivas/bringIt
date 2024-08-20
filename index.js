require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const path = require('path');



console.log("Starting the server...");  // Added logging

const app = express();


// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to the database');
});

 // Middleware to parse JSON request bodies
app.use(express.json());



// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.get('/signUpPage', (req, res) => {
    res.render('signUpPage');
});
// Example route for dashboard page
app.get('/', (req, res) => {
    res.render('dashboard');
});

app.get('/home', (req, res) => {
    res.render('home'); // Ensure 'home.ejs' exists in the 'views' directory
});



app.use('/auth', authRoutes);
// Use user routes
app.use('/api/users', userRoutes);


// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}, ....Open Using http://localhost:${PORT}/'`);
});

console.log("Server setup complete.");  // Added logging
console.log('View engine set to EJS');
console.log('Views directory:', path.join(__dirname, 'views'));
