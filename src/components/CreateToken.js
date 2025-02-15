import React, { useState, useEffect } from 'react';
import { Contract, BrowserProvider, formatUnits, parseUnits } from 'ethers';
import TokenManagement from './TokenManagement';
import TokenFactoryABI from './abis/TokenFactoryABI.json';
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";

const FACTORY_CONTRACT_ADDRESS = "0xE32Af55ef214292298F5A6C8399953A265493D83";
const EXPECTED_NETWORK_ID = "0xaa36a7"; // Sepolia network ID
const NETWORK_NAME = "Sepolia";


const CreateToken = () => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [initialSupply, setInitialSupply] = useState('');
  const [factoryContract, setFactoryContract] = useState(null);
  const [account, setAccount] = useState('');
  const [createdTokens, setCreatedTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);

  // Check if we're on the correct network
  const checkNetwork = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log("Current chainId:", chainId);
      
      if (chainId !== EXPECTED_NETWORK_ID) {
        setNetworkError(`Please switch to ${NETWORK_NAME} network. Current network ID: ${chainId}`);
        
        // Prompt user to switch to Sepolia
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: EXPECTED_NETWORK_ID }],
          });
          setNetworkError(null);
          return true;
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: EXPECTED_NETWORK_ID,
                    chainName: 'Sepolia Test Network',
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'SepoliaETH',
                      decimals: 18
                    },
                    rpcUrls: ['https://sepolia.infura.io/v3/'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io/']
                  }
                ]
              });
              return true;
            } catch (addError) {
              console.error("Error adding network:", addError);
              return false;
            }
          }
          console.error("Error switching network:", switchError);
          return false;
        }
      }
      setNetworkError(null);
      return true;
    } catch (err) {
      console.error("Error checking network:", err);
      setNetworkError("Could not verify network");
      return false;
    }
  };
  
  const connectWallet = async () => {
    try {
      setError(null);
      setIsLoading(true);
  
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed!");
      }
  
      // Check network first
      const correctNetwork = await checkNetwork();
      if (!correctNetwork) {
        throw new Error(`Please connect to the ${NETWORK_NAME} network`);
      }
  
      // Initialize provider
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      console.log("Connected account:", accounts[0]);
  
      const signer = await provider.getSigner();
      console.log("Signer created", await signer.getAddress());
  
      // Create contract instance with explicit connection to both provider and signer
      const tempContract = new Contract(
        FACTORY_CONTRACT_ADDRESS,
        TokenFactoryABI,
        provider
      ).connect(signer);
  
      // Log contract state
      console.log("Contract address:", FACTORY_CONTRACT_ADDRESS);
      console.log("Contract interface:", tempContract.interface.fragments);
      
      // Test if we can access the contract
      try {
        const code = await provider.getCode(FACTORY_CONTRACT_ADDRESS);
        console.log("Contract code exists:", code !== '0x' && code !== '0x0');
      } catch (e) {
        console.error("Error getting contract code:", e);
      }
  
      setFactoryContract(tempContract);
      setAccount(accounts[0]);
  
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsLoading(false);
    }
  };

  // Create Token Function
  const createToken = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
  
    if (!name || !symbol || !initialSupply) {
      setError("Please fill all fields.");
      setIsLoading(false);
      return;
    }
  
    try {
      // Convert initial supply to the correct format (with 18 decimals)
      const supply = parseUnits(initialSupply, 18);
      
      // Estimate gas first to check if the transaction will fail
      const gasEstimate = await factoryContract.createToken.estimateGas(
        name,
        symbol,
        supply
      );
  
      console.log("Gas estimate:", gasEstimate.toString());
  
      // Convert gas estimate to BigInt and add 20% buffer
      /* global BigInt */
      const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);
  
      const tx = await factoryContract.createToken(
        name,
        symbol,
        supply,
        { gasLimit }
      );
  
      console.log("Transaction sent:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      alert("Token Created Successfully!");
      await fetchCreatedTokens();
      
      // Clear form
      setName('');
      setSymbol('');
      setInitialSupply('');
    } catch (err) {
      console.error("Error creating token:", err);
      setError(err.message || "Error creating token. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

 
  // Fetch Created Tokens
  const fetchCreatedTokens = async () => {
    try {
      if (!factoryContract || !account) {
        console.log("Missing requirements:", { factoryContract: !!factoryContract, account: !!account });
        return;
      }
      
      console.log("Fetching tokens for account:", account);
      
      // Call the contract method directly
      const tokens = await factoryContract.getTokensByOwner(account);
      console.log("Tokens retrieved:", tokens);
      
      if (Array.isArray(tokens)) {
        setCreatedTokens(tokens);
      }
    } catch (err) {
      console.error("Error fetching tokens:", err);
      setError(err.message || "Failed to fetch tokens");
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (account && factoryContract) {
      fetchCreatedTokens();
      
    }
  }, [account, factoryContract]);

 return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create Custom Token</h2>
          <NetworkStatus
            networkName={NETWORK_NAME}
            isCorrectNetwork={!networkError}
            account={account}
          />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 ease-in-out disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <form onSubmit={createToken} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                placeholder="e.g., My Custom Token"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Symbol
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                placeholder="e.g., MCT"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Supply
              </label>
              <input
                type="number"
                value={initialSupply}
                onChange={(e) => setInitialSupply(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                placeholder="e.g., 1000000"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 ease-in-out disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Token...
                </>
              ) : (
                'Create Token'
              )}
            </button>
          </form>
        )}
         <Alert variant="default" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          After creating a token, import the token address in your MetaMask wallet to view your tokens.
        </AlertDescription>
      </Alert>

        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Created Tokens</h3>
          {createdTokens.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No tokens created yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {createdTokens.map((token, index) => (
                <TokenCard
                  key={index}
                  token={token}
                  isSelected={token === selectedToken}
                  onSelect={() => setSelectedToken(token === selectedToken ? null : token)}
                />
              ))}
            </div>
          )}
        </div>

        {selectedToken && (
          <div className="mt-8">
            <TokenManagement
              tokenAddress={selectedToken}
              account={account}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const NetworkStatus = ({ networkName, isCorrectNetwork, account }) => (
  <div className="flex items-center space-x-4">
    <div className="flex items-center">
      <div className={`h-2 w-2 rounded-full ${isCorrectNetwork ? 'bg-green-400' : 'bg-red-400'} mr-2`}></div>
      <span className="text-sm text-gray-600">{networkName}</span>
    </div>
    {account && (
      <div className="text-sm text-gray-600">
        {`${account.slice(0, 6)}...${account.slice(-4)}`}
      </div>
    )}
  </div>
);
const TokenCard = ({ token, isSelected, onSelect }) => (
  <div className={`p-4 rounded-lg border ${isSelected ? 'border-gray-400 bg-gray-50' : 'border-gray-200'} transition-all duration-200`}>
    <div className="flex items-center justify-between">
      <a
        href={`https://sepolia.etherscan.io/address/${token}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-900 hover:text-gray-600 transition-colors font-medium"
      >
        {token}
      </a>
      <button
        onClick={onSelect}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
          ${isSelected 
            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
      >
        {isSelected ? 'Hide' : 'Manage'}
      </button>
    </div>
  </div>
);

export default CreateToken;