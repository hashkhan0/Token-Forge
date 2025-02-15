import React from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Navbar = ({ account, user }) => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <h1 className="text-xl font-semibold text-gray-900">TokenForge by Hashir</h1>
          
          <div className="flex items-center space-x-4">
            {account && (
              <div className="hidden md:flex items-center px-3 py-1 bg-gray-50 rounded-full">
                <span className="h-2 w-2 bg-green-400 rounded-full mr-2"></span>
                <span className="text-sm text-gray-600 font-medium">
                  {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </span>
              </div>
            )}
            
            {!user ? (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; // Add this export