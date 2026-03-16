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

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token given' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        const result = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [user.id]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Error verifying token:', err);
        return res.status(403).json({ error: 'Invalid token' });
    }
};

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

        res.json(userData.rows[0]);
    } catch (err) {
        console.error('Error fetching user status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await pool.query(
            'SELECT user_id, first_name, last_name, email FROM users WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/userBooks/:userId', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM user_books WHERE user_id = $1',
            [req.params.userId]
        );
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

app.get('/progress/:userId', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM progress WHERE user_id = $1', [req.params.userId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching progress:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/progress/:userId/:bookId', async (req, res) => {
    const { userId, bookId } = req.params;
    const { pages_read, total_pages } = req.body;

    try {
        // Upsert progress
        const result = await pool.query(
            `INSERT INTO progress (user_id, book_id, pages_read, total_pages)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, book_id) 
             DO UPDATE SET pages_read = $3, total_pages = $4
             RETURNING *`,
            [userId, bookId, pages_read, total_pages || 0]
        );

        // Check if finished (allow total_pages to be 0 for simplicity if unknown, but assuming valid > 0)
        if (total_pages > 0 && pages_read >= total_pages) {
            await pool.query(
                `UPDATE user_books SET have_read = true, want_to_read = false
                 WHERE user_id = $1 AND book_id = $2`,
                [userId, bookId]
            );
            await pool.query(
                `UPDATE progress SET status = 'Completed', completed_at = NOW()
                 WHERE user_id = $1 AND book_id = $2`,
                [userId, bookId]
            );
        } else {
            await pool.query(
                `UPDATE progress SET status = 'Reading'
                 WHERE user_id = $1 AND book_id = $2`,
                [userId, bookId]
            );
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating progress:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`User service running on port ${PORT}`);
});
