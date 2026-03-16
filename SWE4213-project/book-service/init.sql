CREATE TABLE IF NOT EXISTS books (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    total_pages INTEGER NOT NULL,
    genre VARCHAR(255),
    summary TEXT,
    cover_url TEXT
);

INSERT INTO books (title, author, total_pages, genre, summary, cover_url) VALUES
    ('The Hunger Games', 'Suzanne Collins', 374, 'Science fiction', 'The Hunger Games follows 16-year-old Katniss Everdeen, a girl from District 12 who volunteers for the 74th Hunger Games in place of her younger sister Primrose Everdeen.', 'https://upload.wikimedia.org/wikipedia/en/d/dc/The_Hunger_Games.jpg'),
    ('Romeo and Juliet', 'William Shakespeare', 96, 'Tragedy', 'Tragedy written by William Shakespeare about the romance between two young Italians from feuding families', 'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1629680008i/18135.jpg');

