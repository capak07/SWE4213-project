import { useState, useEffect } from 'react';
import { Search, Bell, SlidersHorizontal } from 'lucide-react';
import BookCard from './BookCard';
import AddBookModal from './AddBookModal';
import NotificationModal from './NotificationModal'

const Dashboard = ({ onBookSelect, user }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [bookRatings, setBookRatings] = useState({});
    const [userBookStatuses, setUserBookStatuses] = useState({});
    const [sortBy, setSortBy] = useState('title');
    const [showSortMenu, setShowSortMenu] = useState(false);

    const filteredBooks = books
        .filter(book => {
            const match = search.toLowerCase();
            return (
                book.title.toLowerCase().includes(match) ||
                book.author.toLowerCase().includes(match) ||
                (book.genre && book.genre.toLowerCase().includes(match))
            );
        })
        .sort((a, b) => {
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'author') return a.author.localeCompare(b.author);
            if (sortBy === 'rating') return (bookRatings[b.book_id] || 0) - (bookRatings[a.book_id] || 0);
            return 0;
        });

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const res = await fetch('/api/books');
                if (res.ok) {
                    const data = await res.json();
                    setBooks(data);

                    // Fetch ratings for each book
                    const ratings = {};
                    await Promise.all(
                        data.map(async (book) => {
                            try {
                                const reviewRes = await fetch(`/api/reviews/book/${book.book_id}`);
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
                    setBookRatings(ratings);
                }
            } catch (err) {
                console.error("Error fetching books:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserBooks = async () => {
            if (!user) return;
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`/api/userBooks/${user.user_id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const statuses = {};
                    (data.books || []).forEach(ub => {
                        statuses[ub.book_id] = { have_read: ub.have_read, want_to_read: ub.want_to_read };
                    });
                    setUserBookStatuses(statuses);
                }
            } catch (err) {
                console.error("Error fetching user books:", err);
            }
        };

        const fetchAuthorRecs = async () => {
            if (!user) return;
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`/api/rec/author/${user.user_id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    //setUserBookStatuses(statuses);
                }
            } catch (err) {
                console.error("Error fetching user books:", err);
            }
        };

        const fetchRatingRecs = async () => {
            if (!user) return;
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`/api/rec/rating`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    //setUserBookStatuses(statuses);
                }
            } catch (err) {
                console.error("Error fetching user books:", err);
            }
        };

        const fetchGenreRecs = async () => {
            if (!user) return;
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`/api/rec/genre/${user.user_id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    //setUserBookStatuses(statuses);
                }
            } catch (err) {
                console.error("Error fetching user books:", err);
            }
        };

        fetchBooks();
        fetchUserBooks();
        fetchAuthorRecs();
        fetchRatingRecs();
        fetchGenreRecs();
    }, [user]);

    const handleBookAdded = (newBook) => {
        setBooks([newBook, ...books]);
    };

    if (loading) return (
        <div className="min-h-screen bg-cream flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading books...</span>
            </div>
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-cream">
                <div className="max-w-3xl mx-auto px-4 py-6">
                    {/* Header / Search Bar */}
                    <div className="flex items-center gap-3 mb-8">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by title, author, or genre..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white/90 border-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-800 placeholder-gray-400 shadow-sm"
                            />
                        </div>

                        {/* Sort Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortMenu(!showSortMenu)}
                                className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/90 hover:bg-white transition-colors text-gray-700 shadow-sm text-sm font-medium"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="hidden sm:inline">Filter/Sort by...</span>
                            </button>
                            {showSortMenu && (
                                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 min-w-[160px]">
                                    {[
                                        { key: 'title', label: 'Title' },
                                        { key: 'author', label: 'Author' },
                                        { key: 'rating', label: 'Highest Rated' },
                                    ].map(opt => (
                                        <button
                                            key={opt.key}
                                            onClick={() => { setSortBy(opt.key); setShowSortMenu(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${sortBy === opt.key ? 'text-primary font-medium' : 'text-gray-600'}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notification Bell */}
                        <button 
                            onClick={() => setIsNotificationModalOpen(true)}
                            className="relative p-3.5 rounded-full bg-white/90 hover:bg-white transition-colors shadow-sm"
                        >
                            <Bell className="w-5 h-5 text-gray-700" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>

                    {/* Books List */}
                    <div className="mb-24">
                        {filteredBooks.length === 0 ? (
                            <div className="text-center py-16">
                                <span className="text-5xl block mb-4">📚</span>
                                <p className="text-gray-600 text-lg font-medium">No books found</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {search ? 'Try a different search term' : 'Click "Request a Book" to get started'}
                                </p>
                            </div>
                        ) : (
                            filteredBooks.map((book) => (
                                <BookCard
                                    key={book.book_id}
                                    book={book}
                                    avgRating={bookRatings[book.book_id] || 0}
                                    onViewDetails={onBookSelect}
                                    userBookStatus={userBookStatuses[book.book_id]}
                                />
                            ))
                        )}
                    </div>

                    {/* Request a Book Button - Fixed at bottom */}
                    <button
                        onClick={() => setIsAddBookModalOpen(true)}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-primary hover:bg-primary-dark text-white font-semibold px-10 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl text-base z-10"
                    >
                        Request a Book
                    </button>
                </div>
            </div>

            {/* Add Book Modal */}
            <AddBookModal
                isOpen={isAddBookModalOpen}
                onClose={() => setIsAddBookModalOpen(false)}
                onBookAdded={handleBookAdded}
            />

            {/* Notification Modal */}
            <NotificationModal
                isOpen={isNotificationModalOpen}
                onClose={() => setIsNotificationModalOpen(false)}
                user={user}
            />
        </>
    );
};

export default Dashboard;