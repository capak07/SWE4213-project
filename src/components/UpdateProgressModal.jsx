import React, { useState } from 'react';

const UpdateProgressModal = ({ isOpen, onClose, user, bookUpdating, onProgressUpdated }) => {
    const [pagesRead, setPagesRead] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const token = localStorage.getItem('token');
        const pagesReadInt = parseInt(pagesRead);

        try {
            const response = await fetch(`/api/progress/${user.user_id}/${bookUpdating.book_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    pages_read: pagesReadInt,
                    status,
                    total_pages: bookUpdating.total_pages
                }),
            });

            const data = await response.json();

            if (response.ok) {
                onProgressUpdated(data);
                setStatus('')
                setPagesRead('');
                onClose();
            } else {
                setError(data.error || 'Failed to update progress');
            }
        } catch (err) {
            setError('Could not connect to the server');
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white/95 rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                
                {/* Content overlay to ensure text is readable */}
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Update Progress</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pages Read *</label>
                            <input
                                type="text"
                                required
                                placeholder="Enter the number of pages read"
                                value={pagesRead}
                                onChange={(e) => setPagesRead(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-white/90"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Reading, Completed, Pause, Did Not Finish"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-white/90"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium bg-white/90"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Updating...' : 'Update Progress'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
       
    );
};

export default UpdateProgressModal;
