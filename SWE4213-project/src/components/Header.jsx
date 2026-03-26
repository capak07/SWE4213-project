import React from 'react';
import { BookOpen, User, LogOut, Heart } from 'lucide-react';

const Header = ({ onNavigate, onLogout, user }) => {
    return (
        <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-30">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Brand */}
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="flex items-center gap-2 group"
                >
                    <BookOpen className="w-6 h-6 text-primary group-hover:text-primary-dark transition-colors" />
                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-primary-dark transition-colors m-0">
                        Readily
                    </h2>
                </button>

                {/* Navigation */}
                <nav className="flex items-center gap-1">
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 transition-all"
                    >
                        <BookOpen className="w-4 h-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </button>

                    {user && (
                        <>
                            <button
                                onClick={() => onNavigate('rec')}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 transition-all"
                            >
                                <Heart className="w-4 h-4" />
                                <span className="hidden sm:inline">Recommendations</span>
                            </button>
                            <button
                                onClick={() => onNavigate('profile')}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-primary hover:bg-primary/5 transition-all"
                            >
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline">Profile</span>
                            </button>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all ml-1"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
