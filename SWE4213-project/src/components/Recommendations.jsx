import { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import BookCard from './BookCard';

const Recommendations = ({  user, onBookSelect }) => {
    const [topRated, setTopRated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topAuthor, setTopAuthor] = useState([]);
    const [topGenre, setTopGenre] = useState([]);
    const [userBookStatuses, setUserBookStatuses] = useState({});
    const [sortBy, setSortBy] = useState('rating');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [bookRatings, setBookRatings] = useState({});
    const [books, setBooks] = useState([]);



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
                    setTopAuthor(data);
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
                    setTopRated(data);
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
                    setTopGenre(data);
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

    const recommendationsMap = {
        rating: topRated,
        author: topAuthor,
        genre: topGenre
    };

    const recommendations = recommendationsMap[sortBy] || [];

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
                        {/* Sort Button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSortMenu(!showSortMenu)}
                                className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/90 hover:bg-white transition-colors text-gray-700 shadow-sm text-sm font-medium"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span className="hidden sm:inline">Recommend by...</span>
                            </button>
                            {showSortMenu && (
                                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20 min-w-[160px]">
                                    {[
                                        { key: 'rating', label: 'Top Rated' },
                                        { key: 'author', label: 'Author' },
                                        { key: 'genre', label: 'Genre' },
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
                    </div>

                    {/* Books List */}
                    <div className="mb-24">
                        {recommendations.length === 0 ? (
                            <div className="text-center py-16">
                                <span className="text-5xl block mb-4">📚</span>
                                <p className="text-gray-600 text-lg font-medium">No books found</p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Try a different recommendation category
                                </p>
                            </div>
                        ) : (
                            recommendations.map((book) => (
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
                </div>
            </div>
        </>
    );
};

export default Recommendations;