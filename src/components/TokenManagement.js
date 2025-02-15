import React, { useState, useEffect } from 'react';
import { Contract, BrowserProvider, formatUnits, parseUnits } from 'ethers';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert,AlertDescription } from './ui/alert';

// ERC20 ABI for token interactions
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function burn(uint256 amount) returns (bool)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

const TokenManagement = ({ tokenAddress, account }) => {
  const [tokenContract, setTokenContract] = useState(null);
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [balance, setBalance] = useState('0');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const initializeToken = async () => {
      if (window.ethereum && tokenAddress) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const token = new Contract(tokenAddress, ERC20_ABI, signer);
          
          setTokenContract(token);
          
          // Get token details
          const name = await token.name();
          const symbol = await token.symbol();
          const decimals = await token.decimals();
          const rawBalance = await token.balanceOf(account);
          
          setTokenName(name);
          setTokenSymbol(symbol);
          setBalance(formatUnits(rawBalance, decimals));
        } catch (err) {
          console.error("Error initializing token:", err);
          setError("Failed to initialize token contract");
        }
      }
    };

    initializeToken();
  }, [tokenAddress, account]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (!recipientAddress || !transferAmount) {
        throw new Error("Please fill in all fields");
      }

      const decimals = await tokenContract.decimals();
      const amount = parseUnits(transferAmount, decimals);
      
      const tx = await tokenContract.transfer(recipientAddress, amount);
      console.log("Transfer transaction sent:", tx.hash);
      
      await tx.wait();
      
      // Update balance
      const newBalance = await tokenContract.balanceOf(account);
      setBalance(formatUnits(newBalance, decimals));
      
      setSuccessMessage(`Successfully transferred ${transferAmount} ${tokenSymbol} to ${recipientAddress}`);
      setTransferAmount('');
      setRecipientAddress('');
    } catch (err) {
      console.error("Transfer error:", err);
      setError(err.message || "Failed to transfer tokens");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBurn = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (!burnAmount) {
        throw new Error("Please enter amount to burn");
      }

      const decimals = await tokenContract.decimals();
      const amount = parseUnits(burnAmount, decimals);
      
      const tx = await tokenContract.burn(amount);
      console.log("Burn transaction sent:", tx.hash);
      
      await tx.wait();
      
      // Update balance
      const newBalance = await tokenContract.balanceOf(account);
      setBalance(formatUnits(newBalance, decimals));
      
      setSuccessMessage(`Successfully burned ${burnAmount} ${tokenSymbol}`);
      setBurnAmount('');
    } catch (err) {
      console.error("Burn error:", err);
      setError(err.message || "Failed to burn tokens");
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenContract) {
    return <div>Loading token contract...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {tokenName} <span className="text-gray-500">({tokenSymbol})</span>
          </h2>
          <p className="text-gray-600 mt-1">
            Balance: {parseFloat(balance).toFixed(4)} {tokenSymbol}
          </p>
        </div>
        <div className="bg-gray-50 px-4 py-2 rounded-lg">
          <p className="text-sm font-medium text-gray-600">
            Token Address: {`${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Transfer Form */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Transfer Tokens</h3>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                placeholder="0x..."
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                placeholder="Amount in Wei"
                disabled={isLoading}
                min="0"
                step="any"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Transfer'
              )}
            </button>
            <Alert variant="default" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
        If you transfer tokens to another user, they must import this token address to see  received tokens.
        </AlertDescription>
      </Alert>
          </form>
        </div>

        {/* Burn Form */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Burn Tokens</h3>
          <form onSubmit={handleBurn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Burn
              </label>
              <input
                type="number"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                placeholder="0.0"
                disabled={isLoading}
                min="0"
                step="any"
              />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Burn'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

 
export default TokenManagement;