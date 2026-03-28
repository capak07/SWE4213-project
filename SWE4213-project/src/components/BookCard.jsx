import React from 'react';

const StarRating = ({ rating, size = 'md', interactive = false, onRate }) => {
    const sizeClasses = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';
    return (
        <span className={`${sizeClasses} flex gap-0.5`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`${star <= Math.round(rating) ? 'text-gold' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-gold-dim transition-colors' : ''}`}
                    onClick={() => interactive && onRate && onRate(star)}
                >
                    ★
                </span>
            ))}
        </span>
    );
};

const BookCard = ({ book, avgRating, onViewDetails, userBookStatus }) => {
    const statusLabel = userBookStatus?.have_read
        ? 'Have Read'
        : userBookStatus?.want_to_read
            ? 'Want to Read'
            : null;
    

    const statusColor = userBookStatus?.have_read
        ? 'bg-primary text-white'
        : 'bg-primary/80 text-white';

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-100 mb-4">
            {/* Genre label */}
            {book.genre && (
                <div className="bg-cream-dark/40 px-5 py-2">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{book.genre}</span>
                </div>
            )}

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
                        <h3 className="text-lg font-bold text-gray-800 truncate mb-0.5">{book.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">by {book.author}</p>

                        <div className="flex items-center gap-2 mb-3">
                            <StarRating rating={avgRating || 0} size="sm" />
                            {avgRating > 0 && (
                                <span className="text-xs text-gray-400">({avgRating.toFixed(1)})</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {statusLabel && (
                                <span className={`inline-block text-xs font-medium px-3 py-1.5 rounded-full ${statusColor}`}>
                                    {statusLabel}
                                </span>
                            )}

                            <button
                                onClick={() => onViewDetails(book)}
                                className="text-sm font-medium text-primary hover:text-primary-dark border border-primary/30 hover:border-primary px-4 py-1.5 rounded-full transition-all hover:bg-primary/5"
                            >
                                Book Details and Reviews
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
export { StarRating };
