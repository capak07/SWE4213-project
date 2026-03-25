const express = require('express');

const app = express();
app.use(express.json());

const PORT = 3004;

const BOOK_SERVICE_URL = process.env.BOOK_SERVICE_URL || 'http://localhost:3002';
const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || 'http://localhost:3003';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

app.get('/health', async (req, res) => {
  res.status(200).json({message: 'Recommendation service is running'});
});

app.get('/rec/rating', async (req, res) => {
    try {
        const booksResponse = await fetch(`${BOOK_SERVICE_URL}/books`);
        const books = await booksResponse.json();

        // Fetch ratings for each book
        const ratings = {};
        await Promise.all(
            books.map(async (book) => {
                try {
                    const reviewRes = await fetch(`${REVIEW_SERVICE_URL}/reviews/book/${book.book_id}`);
                    if (reviewRes.ok) {
                        const reviews = await reviewRes.json();
                        if (reviews.length > 0) {
                            const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                            ratings[book.book_id] = avg;
                        }
                    }
                } catch (e) {
                    // Skip rating for this book
                }
            })
        );

        topRated = Object.entries(ratings).sort((a, b) => b[1] - a[1]).slice(0,10).map(([book_id, avg]) => ({...books.find(b => b.book_id == book_id), average: avg}));
        
        res.json(topRated);

    } catch (err) {
        console.error('Error getting recommendations based on average ratings:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/rec/author/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const header = req.headers.authorization;
        const userBooksRes = await fetch(`${USER_SERVICE_URL}/userBooks/${id}`, {
                    headers: { 'Authorization': header }
                });

        const userBooks = await userBooksRes.json();
        
        const books = [];
        await Promise.all(
            userBooks.books.map(async (userBook) => {
                try {
                    const bookRes = await fetch(`${BOOK_SERVICE_URL}/books/${userBook.book_id}`);
                    if (bookRes.ok) {
                        const book = await bookRes.json();
                        books.push(book);
                    }
                } catch (e) {
                    
                }
            })
        );

        if (!books.length) {
            return res.json({message: 'This user does not have any user books'});
        }

        const author_counts = books.reduce((acc, {author}) => {
            acc[author] = (acc[author] || 0) + 1;
            return acc;
        }, {});

        const topAuthor = Object.keys(author_counts).reduce((a, b) =>
            author_counts[a] > author_counts[b] ? a : b
        );

        //get all books with top author
        const topAuthorBooksResponse = await fetch(`${BOOK_SERVICE_URL}/books/author/${topAuthor}`);
        const topAuthorBooks = await topAuthorBooksResponse.json();
        
        res.json(topAuthorBooks);
        
    } catch (err) {
        console.error('Error getting recommendations based on author:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/rec/genre/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const header = req.headers.authorization;
        const userBooksRes = await fetch(`${USER_SERVICE_URL}/userBooks/${id}`, {
                    headers: { 'Authorization': header }
                });

        const userBooks = await userBooksRes.json();
        
        const books = [];
        await Promise.all(
            userBooks.books.map(async (userBook) => {
                try {
                    const bookRes = await fetch(`${BOOK_SERVICE_URL}/books/${userBook.book_id}`);
                    if (bookRes.ok) {
                        const book = await bookRes.json();
                        books.push(book);
                    }
                } catch (e) {
                    
                }
            })
        );

        if (!books.length) {
            return res.json({message: 'This user does not have any user books'});
        }

        const genre_counts = books.reduce((acc, {genre}) => {
            acc[genre] = (acc[genre] || 0) + 1;
            return acc;
        }, {});

        const topGenre = Object.keys(genre_counts).reduce((a, b) =>
            genre_counts[a] > genre_counts[b] ? a : b
        );

        //get all books with top author
        const topGenreBooksResponse = await fetch(`${BOOK_SERVICE_URL}/books/genre/${topGenre}`);
        const topGenreBooks = await topGenreBooksResponse.json();
        
        res.json(topGenreBooks);
        
    } catch (err) {
        console.error('Error getting recommendations based on author:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(PORT, () => {
  console.log(`Review Service running on port ${PORT}`);
});