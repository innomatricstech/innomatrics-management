import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../Reducers/authSlice';
import { Link } from 'react-router-dom';

const SendMail = () => {
  const dispatch = useDispatch();
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const { users, user, loading, error } = useSelector((state) => state.auth);
  const adminName = "ADMIN";

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSubmission = (e) => {
    e.preventDefault();
    const senderEmail = user.email;
    const mailData = {
      sender_email: senderEmail,
      receiver_username: recipient,
      messages: [message],
    };

    const sendMail = async () => {
      try {
        const response = await fetch('/messages/sendAdmin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mailData),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }
        alert('Message sent successfully!');
        setMessage('');
        setRecipient('');
      } catch (error) {
        alert('Failed to send message.');
      }
    };

    sendMail();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
        <Link to="/user" className="text-blue-600 mb-4 block">Home</Link>
        <Link to="/receiveMail" className="text-blue-600 mb-4 block">Check Mail</Link>
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">Send your email</h1>
        <form onSubmit={handleSubmission} className="space-y-4">
          {loading && <p className="text-yellow-500">Loading users...</p>}
          {error && <p className="text-red-500">Only to ADMIN access is allowed for messaging </p>}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              onChange={(e) => setRecipient(adminName)}
              checked={recipient === adminName}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <label className="text-gray-700">{adminName}</label>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here"
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendMail;
