import React, { useState, useEffect } from 'react';

const CommentCard = ({ review, userName, comment, book }) => {
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
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
        return `${Math.floor(diffDays / 365)}y ago`;
    };


    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100 mb-4">
            <div className="p-5">
                <div className="flex gap-5">
                    {/* Book cover */}
                    <div className="w-24 h-36 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
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
                            <span className="text-3xl">📖</span>
                        </div>
                    </div>
        
                    {/* Book info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-800 truncate mb-0.5">{userName} commented on your review of {book.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">{comment.comment_text}</p>
        
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-gray-400">{timeAgo(review.created_at)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default CommentCard;
