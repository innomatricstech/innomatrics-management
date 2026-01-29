// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Authentication/Auth';

function LandingPage() {
  const { currentUser } = useAuth();
  
  return (
    <div className="text-center py-20 bg-gray-50">
      <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
        Project Management Dashboard
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Track your projects, manage tasks, and stay productive with our simple, secure dashboard built with React, Vite, and Firebase.
      </p>
      
      {currentUser ? (
        <Link 
          to="/dashboard" 
          className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition shadow-lg"
        >
          Go to Dashboard
        </Link>
      ) : (
        <div className="space-x-4">
          <Link 
            to="/signup" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            Get Started
          </Link>
          <Link 
            to="/login" 
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300 transition shadow-lg"
          >
            Log In
          </Link>
        </div>
      )}
    </div>
  );
}

export default LandingPage;