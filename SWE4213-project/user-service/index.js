const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authcheck = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST || 'users-db',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'usersdb',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});


app.get('/health', async (req, res) => {
    res.status(200).json({ message: 'User service is running' });
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        const isPasswordValid = await bcrypt.compare(password, user.hashed_pass);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            {
                id: user.user_id,
                email: user.email,
                name: `${user.first_name} ${user.last_name}`
            },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        delete user.hashed_pass;

        res.json({
            message: 'Login successful',
            token,
            user
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/auth/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailFormat.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters in length' });
        }

        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO users (first_name, last_name, email, hashed_pass) 
             VALUES ($1, $2, $3, $4)
             RETURNING user_id, first_name, last_name, email`,
            [first_name, last_name, email, hashedPassword]
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser.rows[0]
        });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/auth/status', authcheck, async (req, res) => {
    try {
        const userData = await pool.query(
            'SELECT user_id, first_name, last_name, email FROM users WHERE user_id = $1',
            [req.user.id]
        );

        if (userData.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            authenticated: true,
            user: userData.rows[0]
        });

    } catch (err) {
        console.error('Error fetching user status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const result = await pool.query(
            'SELECT user_id, first_name, last_name, email FROM users WHERE user_id = $1', [req.params.id]
        );

        if(result.rows.length === 0) {
            return res.status(404).json({ error: 'User was not found'});
        }

        res.json(result.rows[0]);

    }
    catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error'});
    }
});


app.get('/userBooks/:userId', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM user_books WHERE user_id = $1',
            [req.params.userId]
        );

        if(result.rows.length === 0) {
            return res.status(404).json({ error: 'No books found for this user'});
        }

        res.json({ userId: req.params.userId, books: result.rows });

    } catch (err) {
        console.error('Error fetching user books:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/userBooks/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { book_id, have_read, want_to_read } = req.body;

    try {
        const result = await pool.query(
            `INSERT INTO user_books (user_id, book_id, have_read, want_to_read)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, book_id) DO UPDATE SET have_read = $3, want_to_read = $4
             RETURNING *`,
            [userId, book_id, have_read || false, want_to_read || false]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating user books:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`User service running on port ${PORT}`);
});
