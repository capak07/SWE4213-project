const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const PORT = 3002;

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'book-db',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'bookdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

app.get('/health', async (req, res) => {
  await waitForDB();
  res.status(200).json({ message: 'User service is running' });
});

app.get('/books', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY book_id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM books WHERE book_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching book:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/books', async (req, res) => {
  const { title, author, genre, summary, cover_url } = req.body;

  if (!title || !author) {
    return res.status(400).json({ error: 'Title and author are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO books (title, author, genre, summary, cover_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, author, genre, summary, cover_url]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating book:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
        const result = await pool.query(
            "DELETE FROM books WHERE book_id = $1", [id]
        );
        res.status(200).json({ message: "Book successfully deleted" })
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Book Service running on port ${PORT}`);
});

