const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// SQLite Database Setup
const db = new sqlite3.Database('./contacts.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        createTables();
    }
});

// Create contacts table
function createTables() {
    db.run(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating contacts table:', err.message);
        } else {
            console.log('Contacts table ready');
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            fullname TEXT NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table ready');
        }
    });
}

// Routes

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// GET all contacts
app.get('/api/contacts', (req, res) => {
    db.all('SELECT * FROM contacts ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// GET single contact by ID
app.get('/api/contacts/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM contacts WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'Contact not found' });
        } else {
            res.json(row);
        }
    });
});

// POST new contact (from form submission)
app.post('/api/contacts', (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)';
    db.run(query, [name, email, subject, message], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({
                id: this.lastID,
                message: 'Contact submitted successfully',
                contact: {
                    id: this.lastID,
                    name,
                    email,
                    subject,
                    message
                }
            });
        }
    });
});

// DELETE contact by ID
app.delete('/api/contacts/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM contacts WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Contact not found' });
        } else {
            res.json({ message: 'Contact deleted successfully' });
        }
    });
});

// UPDATE contact by ID
app.put('/api/contacts/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'UPDATE contacts SET name = ?, email = ?, subject = ?, message = ? WHERE id = ?';
    db.run(query, [name, email, subject, message, id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Contact not found' });
        } else {
            res.json({ message: 'Contact updated successfully' });
        }
    });
});

// Authentication Routes

// POST signup (create new user)
app.post('/api/signup', (req, res) => {
    const { fullname, email, username, password } = req.body;

    // Validation
    if (!fullname || !email || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Simple password hashing (in production, use bcrypt)
    const hashedPassword = Buffer.from(password).toString('base64');

    const query = 'INSERT INTO users (fullname, email, username, password) VALUES (?, ?, ?, ?)';
    db.run(query, [fullname, email, username, hashedPassword], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ error: 'Username or email already exists' });
            } else {
                res.status(500).json({ error: err.message });
            }
        } else {
            res.status(201).json({
                message: 'User created successfully',
                userId: this.lastID,
                username: username
            });
        }
    });
});

// POST login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.get(query, [username], (err, user) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (!user) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        // Simple password comparison (in production, use bcrypt)
        const hashedPassword = Buffer.from(password).toString('base64');

        if (hashedPassword === user.password) {
            // Generate simple token (in production, use JWT)
            const token = Buffer.from(username + Date.now()).toString('base64');
            
            res.json({
                message: 'Login successful',
                token: token,
                userId: user.id,
                username: user.username,
                fullname: user.fullname
            });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    });
});

// GET user profile
app.get('/api/users/:username', (req, res) => {
    const { username } = req.params;
    
    const query = 'SELECT id, username, email, fullname, created_at FROM users WHERE username = ?';
    db.get(query, [username], (err, user) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!user) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json(user);
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log(`  GET    http://localhost:${PORT}/api/contacts       - Get all contacts`);
    console.log(`  GET    http://localhost:${PORT}/api/contacts/:id   - Get specific contact`);
    console.log(`  POST   http://localhost:${PORT}/api/contacts       - Submit new contact`);
    console.log(`  PUT    http://localhost:${PORT}/api/contacts/:id   - Update contact`);
    console.log(`  DELETE http://localhost:${PORT}/api/contacts/:id   - Delete contact`);
    console.log(`  POST   http://localhost:${PORT}/api/signup         - Create new user`);
    console.log(`  POST   http://localhost:${PORT}/api/login          - Login user`);
    console.log(`  GET    http://localhost:${PORT}/api/users/:username - Get user profile`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
