import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../Reducers/authSlice';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const { users, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate()
    const handleSubmission = async (username) => {
        const verifiedUser = users.find(
            (user) => user.email === email && user.username === username
        );
        
        if (!verifiedUser) {
            alert('User not found');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const id = verifiedUser._id;

        try {
            const response = await fetch(`/users/updatePassword/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: confirmPassword }), // Send the actual password, not the boolean
            });

            if (!response.ok) {
                throw new Error(`Failed to update password for user with ID: ${id}`);
            }

            const data = await response.json(); // This can be used for additional processing if needed
            alert('Password updated successfully!');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            navigate('/login');

        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        }
    };

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        Forgot Password
                    </h2>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmission(username);
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-gray-600 mb-2" htmlFor="username">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Enter your registered username"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Enter your registered email"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-2" htmlFor="password">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Enter new password"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-2" htmlFor="confirmPassword">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Confirm new password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 transition duration-300"
                        >
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
