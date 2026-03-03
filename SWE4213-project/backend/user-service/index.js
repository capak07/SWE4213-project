const express = require('express');
const authcheck = require('./auth');
const app = express();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3001;
app.use(express.json());

const authcheck = require('./auth');

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
        return res.status(401).json({ error: 'No token given '});
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

        const result = await pool.query('SELECT user_id FROM users WHERE user_id = $1', [user.id]);

        if(result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid token'});
        }

        req.user = user;
        next();
    }
    catch (err) {
        console.error('Error verifying token:', err);
        return res.status(403).json({ error: 'Invalid token'});
    }
  };


app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ error: 'Email and password are required'});
        };
    

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if(result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password'});
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.hashed_pass);
    if(!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password'});
    }

    const token = jwt.sign(
        {
            id: user.user_id,
            email: user.email,
            name: `${user.first_name} ${user.last_name}`
        },
        process.env.JWT_SECRET || 'your_jwt_secret', {expiresIn: '1h'}
    );

    delete user.hashed_pass;

    res.json({
        message: 'Login successful',
        token,
        user
    });

}
catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal server error' });
}

});

app.post('/auth/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        
        if(!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required'});
        }

        const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailFormat.test(email)) {
            return res.status(400).json({ error: 'Invalid email format'});
        }

        if(password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters in length'});
        }

        console.log('Checking for existing user with email:', email);
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if(existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email is already registered'});
        }

        console.log('Hashing password for email:', email);
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Inserting new user...');
        const newUser = await pool.query(
            `INSERT INTO users (first_name, last_name, email, hashed_pass) 
             VALUES ($1, $2, $3, $4)
             RETURNING user_id, first_name, last_name, email`,
            [first_name, last_name, email, hashedPassword]
        );

        console.log('User successfully registered');

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser.rows[0]
        });

    }
    catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('auth/status', authcheck, async (req, res) => {
    try {
        const userData = await pool.query(
            'SELECT user_id, first_name, last_name, email FROM users WHERE user_id = $1',[req.user.id]
        );
    }
});

app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.json({ id: userId, username: 'fillerUser'});
});

app.get('/userBooks/:userId', (req, res) => {
    res.json({ userId: req.params.userId, books: ['Book1', 'Book2']});
});

app.put('/userBooks/:userId', (req, res) => {
    const userId = req.params.userId;
    const { books } = req.body;
    res.json({ message: `Updated books for user ${userId}`, books });
});

app.listen(PORT, () => {
    console.log(`User service running on port ${PORT}`);
});