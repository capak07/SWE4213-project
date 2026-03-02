CREATE TABLE BOOKS IF NOT EXISTS (
    book_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(255),
    summary TEXT,
    cover_url TEXT,
)

CREATE TABLE USER_BOOKS IF NOT EXISTS (
    user_book_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    book_id FOREIGN KEY REFERENCES BOOKS(book_id),
    have_read BOOLEAN,
)

CREATE TABLE PROGRESS IF NOT EXISTS (
    progress_id SERIAL PRIMARY KEY,
    pages_read INTERGER NOT NULL,
    user_id INT NOT NULL,
    book_id FOREIGN KEY REFERENCES BOOKS(book_id),
)

INSERT INTO books (title, author, genre, summary, cover_url) VALUES
    ('The Hunger Games', 'Suzanne Collins', 'Science fiction', 'The Hunger Games follows 16-year-old Katniss Everdeen, a girl from District 12 who volunteers for the 74th Hunger Games in place of her younger sister Primrose Everdeen.', 'https://upload.wikimedia.org/wikipedia/en/d/dc/The_Hunger_Games.jpg'),
    ('Romeo and Juliet', 'William Shakespeare', 'Tragedy', 'Tragedy written by William Shakespeare about the romance between two young Italians from feuding families', 'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1629680008i/18135.jpg');

INSERT INTO user_books (user_id, book_id, have_read) VALUES
    (1, 1, TRUE),
    (1, 2, FALSE);
    
INSERT INTO progress (pages_read, user_id, book_id) VALUES
    (100, 2, 1),
    (2, 1, 2);