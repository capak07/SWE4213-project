import { useState, useEffect } from 'react';
import CommentCard from './CommentCard'

const NotificationModal = ({ isOpen, onClose, user }) => {
    const [loading, setLoading] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [userNames, setUserNames] = useState([]);
    const [reviewComments, setReviewComments] = useState([]);
    const [reviewBooks, setReviewBooks] = useState([]);

    useEffect(() => {
        const fetchInteractions = async () => {
            try {
                const res = await fetch(`/api/reviews/user/${user.user_id}`);
                const data = await res.json();
                setReviews(data);

                const comments = [];
                await Promise.all(
                    data.map(async (review) => {
                        try {
                            const commentRes = await fetch(`/api/reviews/${review.review_id}/comments`);
                            if (commentRes.ok) {
                                const commentsData = await commentRes.json();
                                comments.push(...commentsData);
                            }
                        } catch (e) {
                                // Skip comments for this review
                        }
                    })
                );
                setReviewComments(comments);

                // Fetch user names for each comment
                const uniqueUserIds = [...new Set(comments.map((c) => c.user_id))];
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

                // Fetch user names for each comment
                const uniqueBookIds = [...new Set(data.map((r) => r.book_id))];
                const books = {};
                await Promise.all(
                    uniqueBookIds.map(async (bookId) => {
                        try {
                            const bookRes = await fetch(`/api/books/${bookId}`);
                            if (bookRes.ok) {
                                const booksData = await bookRes.json();
                                books[bookId] = booksData;
                            }
                        } catch (e) {
    
                        }
                    })
                );
                setReviewBooks(books);

            } catch (err) {
                console.error("Error fetching interactions:", err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchInteractions();
    }, [user]);

    if (!isOpen) return null;

    

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white/95 rounded-2xl shadow-2xl p-6 w-full max-w-1/2 mx-4 max-h-[90vh] overflow-y-auto">
                    {/* Content overlay to ensure text is readable */}
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Notifications</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        {/* Comments List */}
                        <div className="mb-24">
                            {reviewComments.length === 0 ? (
                                <div className="text-center py-16">
                                    <span className="text-5xl block mb-4">📚</span>
                                    <p className="text-gray-600 text-lg font-medium">No Interactions found</p>
                                </div>
                            ) : (
                                reviewComments.map((comment) => {
                                    const review = reviews.find(r => r.review_id === comment.review_id);
                                    const book = reviewBooks[review.book_id];

                                    return (
                                        <CommentCard
                                            key={comment.comment_id}
                                            review={review}
                                            userName={userNames[comment.user_id]}
                                            comment={comment}
                                            book={book}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default NotificationModal;
