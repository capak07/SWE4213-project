const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authcheck = require('./auth');
const { PrismaClient } = require('./generated/client');
const prisma = new PrismaClient();

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
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ message: 'User service is healthy',
                               database: 'connected'});
    }
    catch(err) {
        res.status(200).json({ message: 'User service is running',
                               databse: 'disconnected'});
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }


        const user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

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

        const { hashed_pass, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword
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

        const existingUser = await prisma.users.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.users.create({
            data: {
                first_name,
                last_name,
                email,
                hashed_pass: hashedPassword,
                yearly_goal: 0,
                books_read_this_year: 0
            },
                select: {
                    user_id: true,
                    first_name: true,
                    last_name: true,
                    email: true
                }
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser
        });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/auth/status', authcheck, async (req, res) => {
    try {
        const userData = await prisma.users.findUnique({
            where: { user_id: req.user.id},
            select: {
                user_id: true,
                first_name: true,
                last_name: true,
                email: true,
                yearly_goal: true,
                books_read_this_year: true
            }
        });

        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            authenticated: true,
            user: userData
        });

    } catch (err) {
        console.error('Error fetching user status:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        const result = await prisma.users.findUnique({
            where: { user_id: userId },
            select: {
                
            }
        })

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

app.get('/progress/:userId', async (req, res) => {
    try {

        if(parseInt(req.params.userId) === 0) {
            return res.status(404).json({ error: 'You can only access your own progress'});
        }

        const progress = await prisma.progress.findMany({
            where: {user_id: req.params.id},
            select: {
                progress_id: true,
                book_id: true,
                pages_read: true,
                total_pages: true,
                started_at: true,
                completed_at: true

            },
            orderBy: { started_at: 'desc'}

        });

        res.json({
            userId: req.params.userId,
            progress
        });
    }
    catch(err) {
        console.error('Error fetching user progress:', err);
        res.status(500).json({ error: 'Internal server error'});
    }
});

app.post('/progress', async (req, res) => {
    try {
        const { title, total_pages} = req.body;

        if(!title) {
            return res.status(400).json({ error: 'Book title is required'});
        }

        const created = await prisma.progress.findUnqiue({
            where: {
                user_id_book_id: {
                    user_id: req.params.id,
                    book_id: book_id
                }
            }
        });

        if(created) {
            return res.status(400).json({ error: 'Progress for this book is already being tracked.'});
        }

        const progress = await prisma.progress.create({
            data: {
                user_id: req.params.id,
                book_id: book_id,
                pages_read: 0,
                total_pages: total_pages || 0,
                status: 'Reading',
                started_at: new Date()
            }
        });

        res.status(201).json({
            message: 'Progress successfully created',
            progress
        });

    }
    catch (err) {
        console.error('Error creating progress entry:', err);
        res.status(500).json({ error: 'Internal server error'});
    }

});

app.put('progress/:userId/:bookId', async (req, res) => {
    try {
        if(parseInt(req.params.userId) === 0) {
            return res.status(404).json({ error: 'You can only update your own progress.'});
        }

        const bookId = parseInt(req.params.bookId);

        const { pages_read, status } = req.body;

        if(pages_read === undefined && !status) {
            return res.status(400).json({ error: 'At least one of pages_read or status must be provided.'});
        }

        const updatedProgress = await prisma.progress.findUnqiue({
            where: {
                user_id_book_id: {
                    user_id: req.user.id,
                    book_id: bookId
                }
            }
        });

        if(!progress) {
            return res.status(404).json({ error: 'Progress entry not found for this book.'});
        }

        if(pages_read !== undefined) {
            if(pages_read > progress.total_pages) {
                return res.status(400).json({ error: 'Pages read cannot exceed total pages.'} );
            }

            updatedProgress.pages_read = pages_read;
        }

        if(status) {
            const validStatuses = ['Reading', 'Completed', 'Paused'];
            if(!validStatuses.includes(status)) {
                return res.status(400).json({ error: `Invalid status. Valid options are: ${validStatuses.join(',')}`});
            }

            updatedProgress.status = status;
        }

        if(status === 'Completed' && updatedProgress.status !== 'Completed') {
            updatedProgress.completed_at = new Date();
        }

        if(status !== 'Completed' && updatedProgress.status === 'Completed') {
            updatedProgress.completed_at = null;
        }

        const savedProgress = await prisma.progress.update({
            where: {
                user_id_book_id: {
                    user_id: req.user.id,
                    book_id: bookId
                }
            },
            data: updatedProgress
        });

        if(status === 'Completed' && updatedProgress.status !== 'Completed') {
            await prisma.users.update({
                where: { user_id: req.user.id},
                data: {
                    books_read_this_year: {
                        increment: 1
                    }
                    
                }
            });

            console.log(`User ${req.user.id} has completed book ${bookId}`);
        }

        res.json({
            message: 'Progress successfully updated',
            progress: savedProgress
        })

    }
    catch (err) {
        console.error('Error updating progress', err);
        res.status(500).json({ error: 'Internal server error'});
    }


});

app.delete('/progress/:userId/:bookId', async (req, res) => {
    try {
        if(parseInt(req.params.userId) === 0) {
            return res.status(404).json({ error: 'You can only delete your own progress.'});
        }

        const bookId = parseInt(req.params.bookId);

        const progress = await prisma.progress.findUnique({
            where: {
                user_id_book_id: {
                    user_id: req.user.id,
                    book_id: bookId
                }
            }
        });

        if(!progress) {
            return res.status(404).json({ error: 'Progress entry not found for this book.'});
        }

        if(progress.status === 'Completed') {
            await prisma.users.update({
                where: { user_id: req.user.id},
                data: {
                    books_read_this_year: {
                        decrement: 1
                    }
                }
            });

            console.log(`Adjusted books read count for user ${req.user.id}`);
        }

            await prisma.progress.delete({
                where: {
                    user_id_book_id: {
                        user_id: req.user.id,
                        book_id: bookId
                    }
                }
            });

            res.json({
                message: 'Progress entry successfully deleted',
                book_id: bookId
            });
        
    }
    catch (err) {
        console.error('Error deleting progress entry:', err);
        res.status(500).json({ error: 'Internal server error'});
    }
});


app.listen(PORT, () => {
    console.log(`User service running on port ${PORT}`);
});
