import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

const Profile = ({ user }) => {
    const [userBooks, setUserBooks] = useState([]);
    const [progress, setProgress] = useState([]);
    const [bookDetails, setBookDetails] = useState({});
    const [progBookDetails, setProgBookDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [wantToReadBooks, setWantToReadBooks] = useState([]);

    useEffect(() => {
        if (!user) return;
        const token = localStorage.getItem('token');

        const fetchData = async () => {
            try {
                // ========== STEP 1: FETCH USER BOOKS ==========
                const userBooksRes = await fetch(`http://localhost:3001/userBooks/${user.user_id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                let userBooksData = [];
                if (userBooksRes.ok) {
                    const data = await userBooksRes.json();
                    userBooksData = data.books || [];
                    setUserBooks(userBooksData);
                }

                // ========== STEP 2: FETCH COMPLETED BOOKS DETAILS ==========
                const completedBookIds = userBooksData
                    .filter(ub => ub.have_read)
                    .map(ub => ub.book_id);

                const details = {};
                await Promise.all(
                    completedBookIds.map(async (bookId) => {
                        try {
                            const bookRes = await fetch(`http://localhost:3002/books/${bookId}`);
                            if (bookRes.ok) {
                                details[bookId] = await bookRes.json();
                            }
                        } catch (e) {
                            // skip
                        }
                    })
                );
                setBookDetails(details);

                // ========== STEP 3: FETCH WANT TO READ BOOKS DETAILS ==========
                const wantToReadIds = userBooksData
                    .filter(ub => ub.want_to_read && !ub.have_read)
                    .map(ub => ub.book_id);

                const wantToReadDetails = [];
                await Promise.all(
                    wantToReadIds.map(async (bookId) => {
                        try {
                            const bookRes = await fetch(`http://localhost:3002/books/${bookId}`);
                            if (bookRes.ok) {
                                const bookData = await bookRes.json();
                                wantToReadDetails.push(bookData);
                            }
                        } catch (e) {
                            console.error(`Error fetching book ${bookId}:`, e);
                        }
                    })
                );
                setWantToReadBooks(wantToReadDetails);

                // ========== STEP 4: FETCH PROGRESS ==========
                const progressRes = await fetch(`http://localhost:3001/progress/${user.user_id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                let progressData = [];
                if (progressRes.ok) {
                    const data = await progressRes.json();
                    progressData = data.progressWithPercentage || [];
                    setProgress(progressData);
                }

                // ========== STEP 5: FETCH BOOK DETAILS FOR PROGRESS ==========
                const progBookIds = [...new Set(progressData.map(prog => prog.book_id))];
                const progDetails = {};
                
                await Promise.all(
                    progBookIds.map(async (bookId) => {
                        try {
                            const bookRes = await fetch(`http://localhost:3002/books/${bookId}`);
                            if (bookRes.ok) {
                                progDetails[bookId] = await bookRes.json();
                            }
                        } catch (e) {
                            // skip
                        }
                    })
                );
                setProgBookDetails(progDetails);

            } catch (err) {
                console.error('Error fetching profile data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const completedBooks = userBooks.filter(ub => ub.have_read);
    const totalBooksRead = user?.books_read_this_year || completedBooks.length;
    const readingNowCount = progress.length;

    if (!user) return (
        <div className="min-h-screen bg-cream flex items-center justify-center">
            <p className="text-gray-500">Not logged in.</p>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen bg-cream flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading profile...</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-cream">
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
                            {getInitials(`${user.first_name} ${user.last_name}`)}
                        </div>

                        {/* User Info */}
                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-2xl font-bold text-gray-800 mb-1">
                                {user.first_name} {user.last_name}
                            </h1>
                            <p className="text-gray-500 mb-4">{user.email}</p>

                            {/* Stats */}
                            <div className="flex gap-6 justify-center sm:justify-start">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-800">{totalBooksRead}</p>
                                        <p className="text-xs text-gray-500">Books Read</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <span className="text-amber-600 text-lg">📖</span>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-800">{readingNowCount}</p>
                                        <p className="text-xs text-gray-500">Reading Now</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 text-lg">☝️</span>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-800">{wantToReadBooks.length}</p>
                                        <p className="text-xs text-gray-500">Want to Read</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Currently Reading */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">📚</span> Currently Reading
                    </h2>

                    {progress.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
                            <span className="text-4xl block mb-3">📖</span>
                            <p className="text-gray-500">You're not reading anything right now.</p>
                            <p className="text-gray-400 text-sm mt-1">Start tracking a book from the dashboard!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {progress.map((item) => {
                                const book = progBookDetails[item.book_id];
                                if (!book) return null;

                                return (
                                    <div key={item.book_id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                                        <div className="flex gap-4 items-center">
                                            {/* Cover */}
                                            <div className="w-12 h-18 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                {book.cover_url ? (
                                                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                                                        <span className="text-xl">📖</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-800 truncate text-sm">{book.title}</h3>
                                                <p className="text-xs text-gray-500">by {book.author}</p>
                                            </div>

                                            <div className="flex-1">
                                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 rounded-full transition-all"
                                                        style={{ width: `${item.percent_complete}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 text-right">{item.percent_complete}% completed</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Want to Read */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">☝️</span> Want to Read
                    </h2>

                    {wantToReadBooks.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
                            <span className="text-4xl block mb-3">📚</span>
                            <p className="text-gray-500">No books added to 'Want to Read'</p>
                            <p className="text-gray-400 text-sm mt-1">Browse books and click "Want to Read" to add them here</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {wantToReadBooks.map((book) => (
                                <div key={book.book_id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                                    <div className="flex gap-4 items-center">
                                        {/* Cover */}
                                        <div className="w-12 h-18 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                            {book.cover_url ? (
                                                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                                                    <span className="text-xl">📖</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-800 truncate text-sm">{book.title}</h3>
                                            <p className="text-xs text-gray-500">by {book.author}</p>
                                            {book.genre && (
                                                <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-1">
                                                    {book.genre}
                                                </span>
                                            )}
                                        </div>

                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full flex-shrink-0">
                                            ☝️ Want to Read
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Books Read */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">✅</span> Books Read
                    </h2>

                    {completedBooks.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
                            <span className="text-4xl block mb-3">📕</span>
                            <p className="text-gray-500">No completed books yet.</p>
                            <p className="text-gray-400 text-sm mt-1">Finish a book and mark it as read!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {completedBooks.map((item) => {
                                const book = bookDetails[item.book_id];
                                if (!book) return null;

                                return (
                                    <div key={item.book_id} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                                        <div className="flex gap-4 items-center">
                                            {/* Cover */}
                                            <div className="w-12 h-18 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                {book.cover_url ? (
                                                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
                                                        <span className="text-xl">📖</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-800 truncate text-sm">{book.title}</h3>
                                                <p className="text-xs text-gray-500">by {book.author}</p>
                                            </div>

                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-full flex-shrink-0">
                                                ✓ Finished
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;