// src/components/Signup.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError("Failed to create account. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Sign Up</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-400 rounded p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
          <button 
            type="submit" 
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-all"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-gray-800 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
