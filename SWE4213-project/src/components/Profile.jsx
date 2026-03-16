import React from 'react';

const Profile = ({ user }) => {
    return (
        <div style={{ padding: '20px' }}>
            <h2>User Profile</h2>
            {user ? (
                <div>
                    <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p style={{ marginTop: '20px', color: '#666', fontStyle: 'italic' }}>
                        (Reading progress tracking UI omitted as it is outside the scope of the Review Service assignment)
                    </p>
                </div>
            ) : (
                <p>Not logged in.</p>
            )}
        </div>
    );
};

export default Profile;
