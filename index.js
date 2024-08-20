require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cardRoutes = require('./routes/cardRoutes');
const itemRoutes = require('./routes/itemRoutes');
const homeRoutes = require('./routes/homeRoutes'); 

const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 } // Set to true if using HTTPS
}));

// Middleware for authentication
function checkAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login'); // Redirect to login if not authenticated
}

// Routes
app.use('/api', cardRoutes);
app.use('/api/cards', itemRoutes);
app.use('/', homeRoutes);
app.use('/auth', authRoutes);

// Route to render the signup/login page
app.get('/login', (req, res) => {
    res.render('signupLoginPage'); // Ensure 'signupLoginPage.ejs' exists in the 'views' directory
});

// Protect the dashboard route
app.get('/dashboard', checkAuthenticated, (req, res) => {
    res.render('dashboard');
});

// Protect the home route
app.get('/home', checkAuthenticated, (req, res) => {
    res.render('home');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}, ....Open Using http://localhost:${PORT}/`);
});

console.log("Server setup complete.");
console.log('View engine set to EJS');
console.log('Views directory:', path.join(__dirname, 'views'));
