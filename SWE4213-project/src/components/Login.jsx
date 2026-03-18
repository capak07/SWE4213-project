import React, { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';

const Login = ({ onLogin, onToggleView }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            
            const response = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                onLogin(data.user);
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Cannot connect to server. Make sure the backend is running.');
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
              Welcome back!
            </h1>
            
            {/* Subheading */}
            <p className="text-gray-600 mb-10">
              Please login to access your account.
            </p>
    
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
    
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="email" className="text-gray-700 font-medium">
                    E-mail
                  </label>
                  <Info className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Type your e-mail"
                  className="w-full px-6 py-4 bg-gray-100 rounded-xl text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  disabled={loading}
                />
              </div>
    
              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Type your password"
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
                
                {/* Forgot Password Link */}
                <a 
                  href="#" 
                  className="inline-block mt-3 text-blue-500 hover:text-blue-600"
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot Password?
                </a>
              </div>
    
              {/* Login Button */}
              <button
                type="submit"
                className={`w-full bg-teal-700 hover:bg-teal-800 text-white font-medium py-4 rounded-full transition-colors mt-8 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
    
            {/* Sign Up Link */}
            <p className="text-center mt-6 text-blue-500">
              Don't have an account?{' '}
              <a 
                href="#" 
                className="hover:text-blue-600 underline"
                onClick={(e) => {
                  e.preventDefault();
                  onToggleView();
                }}
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>
      );
    }
    

export default Login;
