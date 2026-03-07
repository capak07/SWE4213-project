const express = require('express');
const { PrismaClient } = require('./generated/client'); 
const prisma = new PrismaClient();


const app = express();
app.use(express.json());

const PORT = 3002;

app.get('/health', async (req, res) => {
  res.status(200).json({ message: 'Book service is running' });
});

app.get('/books', async (req, res) => {
  try {
    const result = await prisma.books.findMany();
    res.json(result);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await prisma.books.findFirst({
      where: { book_id: Number(id)},
    });
    if (!result) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(result);
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
    const result = await prisma.books.create({
      data: {
        title: title,
        author: author,
        genre: genre,
        summary: summary,
        cover_url: cover_url,
      },
    });
    res.status(200).json(result);
  } catch (err) {
    console.error('Error creating book:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
        const result = await prisma.books.delete({
          where: {book_id: Number(id)}
        });
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

