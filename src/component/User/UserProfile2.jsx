import React, { useEffect, useState } from 'react';

const UserProfile2 = ({ users, email, isAuth, password }) => {
    const [userList, setUsers] = useState([]);
    const [logOut, setLogOut] = useState(isAuth); // Managing logout state

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3000/users', {
                method: 'GET',
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data); // Store the fetched users in userList
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleLogout = async (id) => {
        const verifiedUser = userList.find((user) => user.email === email && user.password === password);
        if (verifiedUser) {
            alert(`Goodbye ${verifiedUser.username}. You are now logged out.`);
            setLogOut(false); // Update to false as user is logging out

            const loggedUser = {
                email,
                password,
                isLoggedIn: false
            };

            try {
                const response = await fetch(`http://localhost:3000/users/logout/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loggedUser),
                });

                if (!response.ok) throw new Error('Failed to update auth');
                const result = await response.json();
                console.log('Logout successful:', result);
            } catch (error) {
                console.error('Error logging out:', error);
            }
        } else {
            alert('Logout failed: user not found');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []); // Fetch users once when the component mounts

    const verifiedUser = userList.find((user) => user.email === email && user.password === password);

    return (
        <>
            <h1>User Profile</h1>
            {verifiedUser ? (
                <>
                    <h3>Welcome {verifiedUser.username}</h3>
                    <p>Email: {verifiedUser.email}</p>
                    <p>Department: {verifiedUser.department}</p>
                    <p>Logged In: {logOut ? 'true' : 'false'}</p>
                    <button onClick={() => handleLogout(verifiedUser._id)}>Logout</button>
                </>
            ) : (
                <p>User not found or not logged in</p>
            )}
        </>
    );
};

export default UserProfile2;
