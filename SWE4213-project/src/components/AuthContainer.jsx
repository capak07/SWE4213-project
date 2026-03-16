import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

const AuthContainer = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div style={{ marginTop: '50px' }}>
            {isLogin ? (
                <Login onLogin={onLogin} onToggleView={() => setIsLogin(false)} />
            ) : (
                <Signup onSignup={onLogin} onToggleView={() => setIsLogin(true)} />
            )}
        </div>
    );
};

export default AuthContainer;
