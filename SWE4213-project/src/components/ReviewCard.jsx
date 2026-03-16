import React, { useState, useEffect } from 'react';
import { StarRating } from './BookCard';

const ReviewCard = ({ review, userName, currentUser }) => {
    const [likesCount, setLikesCount] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [newCommentText, setNewCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentUserNames, setCommentUserNames] = useState({});

    const timeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 1) return 'Today';
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
        }
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        }
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    };

    useEffect(() => {
        let isMounted = true;

        const fetchLikes = async () => {
            try {
                const url = `/api/reviews/${review.review_id}/likes${currentUser ? `?userId=${currentUser.user_id}` : ''}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) {
                        setLikesCount(data.count);
                        setHasLiked(data.hasLiked);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch likes');
            }
        };

        fetchLikes();

        return () => { isMounted = false; };
    }, [review.review_id, currentUser]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/reviews/${review.review_id}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);

                // Fetch comment user names
                const uniqueUserIds = [...new Set(data.map((c) => c.user_id))];
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
                setCommentUserNames(names);
            }
        } catch (err) {
            console.error('Failed to fetch comments');
        }
    };

    const handleToggleLike = async () => {
        if (!currentUser) return; // Must be logged in

        // Optimistic UI update
        const previouslyLiked = hasLiked;
        setHasLiked(!previouslyLiked);
        setLikesCount(prev => previouslyLiked ? prev - 1 : prev + 1);

        try {
            const res = await fetch(`/api/reviews/${review.review_id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: currentUser.user_id })
            });
            if (!res.ok) {
                // Revert on failure
                setHasLiked(previouslyLiked);
                setLikesCount(prev => previouslyLiked ? prev + 1 : prev - 1);
            }
        } catch (err) {
            setHasLiked(previouslyLiked);
            setLikesCount(prev => previouslyLiked ? prev + 1 : prev - 1);
        }
    };

    const handleToggleComments = () => {
        const willShow = !showComments;
        setShowComments(willShow);
        if (willShow && comments.length === 0) {
            fetchComments();
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || !currentUser) return;

        setSubmittingComment(true);
        try {
            const res = await fetch(`/api/reviews/${review.review_id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.user_id,
                    comment_text: newCommentText
                })
            });
            if (res.ok) {
                setNewCommentText('');
                fetchComments(); // Refresh comments list
            }
        } catch (err) {
            console.error('Failed to post comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-gray-800">{userName || 'User'} rated this book</span>
                        <StarRating rating={review.rating} size="sm" />
                    </div>
                    <span className="text-xs text-gray-400">{timeAgo(review.created_at)}</span>
                </div>
            </div>

            {review.review_text && (
                <p className="text-gray-600 text-sm leading-relaxed mt-2">{review.review_text}</p>
            )}

            <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-100">
                <button
                    onClick={handleToggleLike}
                    disabled={!currentUser}
                    className={`flex items-center gap-1.5 text-sm transition-colors group ${hasLiked ? 'text-primary' : 'text-gray-400 hover:text-primary'} ${!currentUser && 'opacity-50 cursor-not-allowed'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={hasLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {likesCount > 0 ? `${likesCount} Likes` : 'Like'}
                </button>
                <button
                    onClick={handleToggleComments}
                    className={`flex items-center gap-1.5 text-sm transition-colors group ${showComments ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    {comments.length > 0 ? `${comments.length} Comments` : 'Comment'}
                </button>
            </div>

            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-50 bg-gray-50/50 rounded-lg -mx-2 px-4 pb-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Comments</h4>

                    {comments.length === 0 ? (
                        <p className="text-sm text-gray-500 italic mb-4">No comments yet. Be the first!</p>
                    ) : (
                        <div className="space-y-3 mb-4">
                            {comments.map(comment => (
                                <div key={comment.comment_id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                        {(commentUserNames[comment.user_id] || 'U')[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-medium text-sm text-gray-800">{commentUserNames[comment.user_id] || 'User'}</span>
                                            <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{comment.comment_text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {currentUser ? (
                        <form onSubmit={handleSubmitComment} className="flex gap-2">
                            <input
                                type="text"
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                disabled={submittingComment}
                            />
                            <button
                                type="submit"
                                disabled={submittingComment || !newCommentText.trim()}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                Post
                            </button>
                        </form>
                    ) : (
                        <p className="text-xs text-gray-500 italic">Login to add a comment.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewCard;
