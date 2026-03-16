import React from 'react';

const Header = ({ onNavigate, onLogout, user }) => {
    return (
        <header style={{ padding: '10px 20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, cursor: 'pointer' }} onClick={() => onNavigate('dashboard')}>Readily</h2>
            <nav style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => onNavigate('dashboard')}>Dashboard</button>
                {user ? (
                    <>
                        <button onClick={() => onNavigate('profile')}>Profile</button>
                        <button onClick={onLogout}>Logout</button>
                    </>
                ) : (
                    <button onClick={onLogout}>Login</button>
                )}
            </nav>
        </header>
    );
};

export default Header;
