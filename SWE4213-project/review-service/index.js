const express = require('express');
const { PrismaClient } = require('./generated/client');
const prisma = new PrismaClient();

const app = express();
app.use(express.json());

const PORT = 3003;

app.get('/health', async (req, res) => {
  res.status(200).json({ message: 'Review service is running' });
});

app.get('/reviews', async (req, res) => {
  try {
    const reviews = await prisma.reviews.findMany({
      orderBy: { created_at: 'desc' },
    });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/reviews/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const review = await prisma.reviews.findUnique({
      where: { review_id: Number(id) },
    });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json(review);
  } catch (err) {
    console.error('Error fetching review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/reviews/book/:bookId', async (req, res) => {
  const { bookId } = req.params;

  try {
    const reviews = await prisma.reviews.findMany({
      where: { book_id: Number(bookId) },
      orderBy: { created_at: 'desc' },
    });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews for book:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/reviews/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const reviews = await prisma.reviews.findMany({
      where: { user_id: Number(userId) },
      orderBy: { created_at: 'desc' },
    });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews for user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/reviews', async (req, res) => {
  const { user_id, book_id, rating, review_text } = req.body;

  if (!user_id || !book_id || !rating) {
    return res.status(400).json({ error: 'user_id, book_id, and rating are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const existing = await prisma.reviews.findUnique({
      where: {
        user_id_book_id: { user_id, book_id },
      },
    });
    if (existing) {
      return res.status(409).json({ error: 'User has already reviewed this book' });
    }

    const review = await prisma.reviews.create({
      data: { user_id, book_id, rating, review_text },
    });
    res.status(201).json(review);
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/reviews/:id', async (req, res) => {
  const { id } = req.params;
  const { rating, review_text } = req.body;

  if (rating !== undefined && (rating < 1 || rating > 5)) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const existing = await prisma.reviews.findUnique({
      where: { review_id: Number(id) },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const data = {};
    if (rating !== undefined) data.rating = rating;
    if (review_text !== undefined) data.review_text = review_text;
    data.updated_at = new Date();

    const review = await prisma.reviews.update({
      where: { review_id: Number(id) },
      data,
    });
    res.json(review);
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/reviews/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.reviews.delete({
      where: { review_id: Number(id) },
    });
    res.status(200).json({ message: 'Review successfully deleted' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Review not found' });
    }
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Review Service running on port ${PORT}`);
});
