import React from 'react';

const StarRating = ({ rating, size = 'md' }) => {
    const sizeClasses = size === 'sm' ? 'text-base' : 'text-xl';
    return (
        <span className={`${sizeClasses} flex gap-0.5`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= Math.round(rating) ? 'text-gold' : 'text-gray-300'}>
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
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
            {/* Genre label */}
            {book.genre && (
                <div className="bg-cream-dark px-4 py-1.5">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{book.genre}</span>
                </div>
            )}

            <div className="p-4">
                <div className="flex gap-4">
                    {/* Book cover */}
                    <div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 shadow-sm">
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
                        <h3 className="text-lg font-bold text-gray-800 truncate">{book.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">by {book.author}</p>

                        {statusLabel && (
                            <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${statusColor} mb-2`}>
                                {statusLabel}
                            </span>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-gray-500">Rating:</span>
                            <StarRating rating={avgRating || 0} size="sm" />
                        </div>

                        <button
                            onClick={() => onViewDetails(book)}
                            className="text-sm font-medium text-primary hover:text-primary-dark border border-primary/30 hover:border-primary px-4 py-1.5 rounded-lg transition-all hover:bg-primary/5"
                        >
                            Reviews
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
export { StarRating };
