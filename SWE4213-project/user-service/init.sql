CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    hashed_pass VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS progress (
    progress_id SERIAL PRIMARY KEY,
    pages_read INTEGER NOT NULL DEFAULT 0,
    total_pages INTEGER NOT NULL,
    books_read_this_year INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Not Started',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    user_id INTEGER REFERENCES users(user_id),
    book_id INTEGER NOT NULL,
    UNIQUE (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS user_books (
    user_book_id SERIAL PRIMARY KEY,
    have_read BOOLEAN NOT NULL DEFAULT FALSE,
    want_to_read BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER REFERENCES users(user_id),
    book_id INTEGER NOT NULL,
    UNIQUE (user_id, book_id)
);

INSERT INTO users (first_name, last_name, email, hashed_pass) VALUES
('John', 'Doe', 'johnDoe@sample.com', '$2b$10$dummyhashfordevonlydonotuseinproduction1234567890abc'),
('Jane', 'Smith', 'janeSmith@unb.ca', '$2b$10$dummyhashfordevonlydonotuseinproduction1234567890def'),
('Ryan', 'Johnson', 'ryanJ@outlook.com', '$2b$10$dummyhashfordevonlydonotuseinproduction1234567890ghi');
