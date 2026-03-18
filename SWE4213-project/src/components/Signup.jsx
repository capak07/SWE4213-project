import React, { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';

const Signup = ({ onSignup, onToggleView }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);  // Added missing state
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);  // Added loading state

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // Fix: Use full URL or setup proxy
            const response = await fetch('http://localhost:3001/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    first_name: firstName, 
                    last_name: lastName, 
                    email, 
                    password 
                }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // For signup, you might want to auto-login or just show success
                onSignup(data.user);
                // Optionally, you could redirect to login
            } else {
                setError(data.error || 'Signup failed');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Cannot connect to server. Make sure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-3"
            style={{
                backgroundImage: `url("./src/background.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-lg">
                {/* Waving Hand Emoji */}
                <div className="mb-6">
                    <span className="text-5xl">👋</span>
                </div>

                {/* Heading */}
                <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    Create Account
                </h1>

                {/* Subheading */}
                <p className="text-gray-600 mb-10">
                    Join Readily to track your reading journey.
                </p>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* First Name Field */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="firstName" className="text-gray-700 font-medium">
                                First Name
                            </label>
                            <Info className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Enter your first name"
                            className="w-full px-6 py-4 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Last Name Field - FIXED: Added proper div wrapper */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="lastName" className="text-gray-700 font-medium">
                                Last Name
                            </label>
                            <Info className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Enter your last name"
                            className="w-full px-6 py-4 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Email Field - ADDED missing email field */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="email" className="text-gray-700 font-medium">
                                Email
                            </label>
                            <Info className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full px-6 py-4 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="password" className="text-gray-700 font-medium">
                                Password
                            </label>
                            <Info className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                className="w-full px-6 py-4 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                disabled={loading}
                            >
                                {showPassword ? (
                                    <Eye className="w-5 h-5" />
                                ) : (
                                    <EyeOff className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Sign Up Button */}
                    <button
                        type="submit"
                        className={`w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-4 rounded-full transition-colors mt-8 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                {/* Login Link */}
                <p className="text-center mt-6 text-blue-500">
                    Already have an account?{' '}
                    <button 
                        onClick={onToggleView} 
                        className="font-medium hover:underline text-blue-500"
                    >
                        Log In
                    </button>
                </p>
            </div>
        </div>
    );
};



export default Signup;
