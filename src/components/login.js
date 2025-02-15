// src/components/Login.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError("Invalid email or password. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-400 rounded p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account? <Link to="/signup" className="text-gray-800 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
