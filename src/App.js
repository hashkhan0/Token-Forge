// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { BrowserProvider, Contract } from 'ethers';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './components/ui/alert'; // Updated import path
import Navbar from './components/Navbar';
import Signup from './components/Signup';
import Login from './components/login';
import Home from './components/Home';
import CreateToken from './components/CreateToken';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { CONTRACT_ADDRESS, ABI } from './config';

function App() {
  const [user, setUser] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (window.ethereum) {
        const tempProvider = new BrowserProvider(window.ethereum);
        await tempProvider.send("eth_requestAccounts", []);
        const tempSigner = await tempProvider.getSigner();
        const tempContract = new Contract(CONTRACT_ADDRESS, ABI, tempSigner);

        setSigner(tempSigner);
        setContract(tempContract);
        setAccount(await tempSigner.getAddress());
      } else {
        throw new Error("MetaMask is not installed!");
      }
    } catch (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Router>
  <div className="min-h-screen bg-gray-100 text-gray-800">
    <Navbar account={account} user={user} />
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <>
                {!account && (
  <div className="text-center">
    <p className="mb-4 text-gray-700 text-lg">
      To access your dashboard, please connect your MetaMask wallet attached to sopolia testnet.
    </p>
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isConnecting ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Connecting...
        </>
      ) : (
        'Connect MetaMask'
      )}
    </button>
  </div>
)}


                {account && (
                  <div className="space-y-10">
                    <Home />
                    <CreateToken />
                  </div>
                )}
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  </div>
</Router>

  );
}

export default App;
