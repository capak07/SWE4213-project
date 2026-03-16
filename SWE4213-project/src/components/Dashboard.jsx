import React, { useState, useEffect } from 'react';

const Dashboard = ({ onBookSelect }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await fetch('/api/books');
                if (res.ok) {
                    const data = await res.json();
                    setBooks(data);
                }
            } catch (err) {
                console.error("Error fetching books:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, []);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Dashboard</h2>
            <p>Select a book below to view its details and write/read reviews.</p>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {books.map(book => (
                    <li key={book.book_id} style={{ margin: '15px 0', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                        <strong>{book.title}</strong> by {book.author_name}
                        <br />
                        <button onClick={() => onBookSelect(book)} style={{ marginTop: '10px' }}>
                            View Details & Reviews
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
