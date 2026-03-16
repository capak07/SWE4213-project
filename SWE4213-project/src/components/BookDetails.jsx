import React, { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import { StarRating } from './BookCard';

const BookDetails = ({ book, user, onBack }) => {
    const [reviews, setReviews] = useState([]);
    const [userNames, setUserNames] = useState({});
    const [loading, setLoading] = useState(true);
    const [newRating, setNewRating] = useState(5);
    const [newReviewText, setNewReviewText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [userBookStatus, setUserBookStatus] = useState({ want_to_read: false, have_read: false });
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchBookData = async () => {
        try {
            const res = await fetch(`/api/reviews/book/${book.book_id}`);
            const data = await res.json();
            setReviews(data);

            // Fetch user names for each review
            const uniqueUserIds = [...new Set(data.map((r) => r.user_id))];
            const names = {};
            await Promise.all(
                uniqueUserIds.map(async (userId) => {
                    try {
                        const userRes = await fetch(`/api/users/${userId}`);
                        if (userRes.ok) {
                            const userData = await userRes.json();
                            names[userId] = `${userData.first_name} ${userData.last_name}`;
                        }
                    } catch (e) {
                        names[userId] = `User ${userId}`;
                    }
                })
            );
            setUserNames(names);

            // Fetch user book status
            if (user) {
                const userBooksRes = await fetch(`/api/userBooks/${user.user_id}`);
                if (userBooksRes.ok) {
                    const userBooksData = await userBooksRes.json();
                    const currentStatus = userBooksData.books?.find((ub) => ub.book_id === book.book_id);
                    if (currentStatus) {
                        setUserBookStatus({
                            want_to_read: currentStatus.want_to_read,
                            have_read: currentStatus.have_read,
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookData();
    }, [book.book_id, user?.user_id]);

    const handleToggleStatus = async (type) => {
        setUpdatingStatus(true);
        const newStatus = { ...userBookStatus };

        if (type === 'want') {
            newStatus.want_to_read = !newStatus.want_to_read;
            if (newStatus.want_to_read) newStatus.have_read = false; // logic
        } else if (type === 'read') {
            newStatus.have_read = !newStatus.have_read;
            if (newStatus.have_read) newStatus.want_to_read = false;
        }

        try {
            const res = await fetch(`/api/userBooks/${user.user_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    book_id: book.book_id,
                    want_to_read: newStatus.want_to_read,
                    have_read: newStatus.have_read
                })
            });
            if (res.ok) {
                setUserBookStatus(newStatus);
            }
        } catch (err) {
            console.error('Failed to update status', err);
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitting(true);

        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.user_id,
                    book_id: book.book_id,
                    rating: newRating,
                    review_text: newReviewText || undefined,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setNewRating(5);
                setNewReviewText('');
                fetchBookData();
            } else {
                setSubmitError(data.error || 'Failed to submit review');
            }
        } catch (err) {
            setSubmitError('Could not connect to the server');
        } finally {
            setSubmitting(false);
        }
    };

    const hasReviewed = reviews.some((r) => r.user_id === user?.user_id);

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                    <path d="m15 18-6-6 6-6" />
                </svg>
                <span className="font-medium">Back to Dashboard</span>
            </button>

            {/* Book Header Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
                <div className="flex gap-6">
                    {/* Cover */}
                    <div className="w-32 h-48 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-md">
                        {book.cover_url ? (
                            <img
                                src={book.cover_url}
                                alt={book.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className={`w-full h-full ${book.cover_url ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40`}
                        >
                            <span className="text-4xl">📖</span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800 mb-1">{book.title}</h1>
                        <p className="text-gray-500 mb-3">by {book.author}</p>
                        {book.summary && (
                            <p className="text-gray-600 text-sm leading-relaxed">{book.summary}</p>
                        )}

                        {/* Status Toggles */}
                        {user && (
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => handleToggleStatus('want')}
                                    disabled={updatingStatus}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${userBookStatus.want_to_read
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {userBookStatus.want_to_read ? '✓ Want to Read' : '+ Want to Read'}
                                </button>
                                <button
                                    onClick={() => handleToggleStatus('read')}
                                    disabled={updatingStatus}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${userBookStatus.have_read
                                        ? 'bg-green-600 text-white border-green-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {userBookStatus.have_read ? '✓ Finished Reading' : 'Mark as Read'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Review Form (if not already reviewed) */}
            {user && !hasReviewed && (
                <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Write a Review</h3>

                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        {submitError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                                {submitError}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setNewRating(star)}
                                        className={`text-2xl transition-colors ${star <= newRating ? 'text-gold hover:text-gold-dim' : 'text-gray-300 hover:text-gold/50'
                                            }`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Review (optional)</label>
                            <textarea
                                placeholder="Share your thoughts about this book..."
                                value={newReviewText}
                                onChange={(e) => setNewReviewText(e.target.value)}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                </div>
            )}

            {/* Reviews List */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Reviews {reviews.length > 0 && `(${reviews.length})`}
                </h2>

                {loading ? (
                    <div className="text-gray-400 animate-pulse text-center py-8">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <span className="text-4xl block mb-3">💬</span>
                        <p>No reviews yet. Be the first to review!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review.review_id}
                                review={review}
                                userName={userNames[review.user_id]}
                                currentUser={user}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookDetails;
