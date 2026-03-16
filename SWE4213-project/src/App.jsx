import { useState, useEffect } from 'react'
import AuthContainer from './components/AuthContainer'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import BookDetails from './components/BookDetails'
import Profile from './components/Profile'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/auth/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('dashboard');
    setSelectedBook(null);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    setSelectedBook(null);
  };

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setCurrentPage('bookDetails');
  };

  const handleBackToDashboard = () => {
    setSelectedBook(null);
    setCurrentPage('dashboard');
  };

  if (authLoading) return <div style={{ padding: '20px' }}>Loading session...</div>;

  return (
    <div style={{ fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      {isLoggedIn && <Header user={user} onNavigate={handleNavigate} onLogout={handleLogout} />}

      <main style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {!isLoggedIn ? (
          <AuthContainer onLogin={handleLogin} />
        ) : (
          <>
            {currentPage === 'dashboard' && <Dashboard onBookSelect={handleBookSelect} />}
            {currentPage === 'profile' && <Profile user={user} />}
            {currentPage === 'bookDetails' && selectedBook && (
              <BookDetails book={selectedBook} user={user} onBack={handleBackToDashboard} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
