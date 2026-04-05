import React, { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import { on } from 'cluster';

const Signup = ({ onSignup, onToggleView }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
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
                onSignup(data.user);
            } else {
                setError(data.error || 'Signup failed');
            }

            const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password}),
            });

            const loginData = await loginResponse.json();

            if (loginResponse.ok) {
                localStorage.setItem('token', loginData.token);
                localStorage.setItem('user', JSON.stringify(loginData.user));
                onSignup(loginData.user);
            }
            else {
                setError('Signup was successful, please log in manually');
                if(onToggleView) onToggleView();
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
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundImage: `url("/src/background.png")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="bg-white rounded-3xl shadow-2xl p-10 sm:p-12 w-full max-w-lg animate-fade-in">
                {/* Waving Hand Emoji */}
                <div className="mb-5">
                    <span className="text-5xl">👋</span>
                </div>

                {/* Heading */}
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    Create Account
                </h1>

                {/* Subheading */}
                <p className="text-gray-500 mb-8">
                    Join Readily to track your reading journey.
                </p>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="firstName" className="block text-gray-700 font-medium text-sm mb-2">
                                First Name
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="First name"
                                className="w-full px-5 py-3.5 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 border-none"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-gray-700 font-medium text-sm mb-2">
                                Last Name
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Last name"
                                className="w-full px-5 py-3.5 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 border-none"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Email Field */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="email" className="text-gray-700 font-medium text-sm">
                                Email
                            </label>
                            <Info className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Type your email address"
                            className="w-full px-5 py-3.5 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 border-none"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label htmlFor="password" className="block text-gray-700 font-medium text-sm mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                className="w-full px-5 py-3.5 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 border-none"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={loading}
                            >
                                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 font-medium text-sm mb-2">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className="w-full px-5 py-3.5 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 border-none"
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={loading}
                            >
                                {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Sign Up Button */}
                    <button
                        type="submit"
                        className={`w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-full transition-all duration-200 mt-4 shadow-md hover:shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                {/* Login Link */}
                <p className="text-center mt-6 text-sm text-gray-500">
                    Already have an account?{' '}
                    <button
                        onClick={onToggleView}
                        className="text-primary hover:text-primary-dark font-medium transition-colors"
                    >
                        Log In
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Signup;
