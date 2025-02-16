Token Forge - ERC-20 Token Generator


Token Forge is a decentralized application (dApp) that allows users to easily create custom ERC-20 tokens on the Ethereum blockchain. It provides an intuitive interface to name tokens, set symbols, specify initial supplies, and deploy them securely using MetaMask.

Features

Custom Token Creation: Users can create their own tokens with custom names, symbols, and initial supplies.
MetaMask Integration: Securely connect and interact with the blockchain using MetaMask.
User Authentication: Firebase authentication system for user registration and login.
Personal Dashboard: Logged-in users can view and manage tokens they have created.
Token Functions: Check balances, transfer tokens, and approve transfers.

Tech Stack


Frontend: React, Tailwind CSS

Backend: Solidity (Smart Contracts)

Blockchain Interaction: Ethers.js

Authentication: Firebase

Deployment: Netlify

Smart Contract Details

The smart contract is developed using Solidity and follows the ERC-20 standard, leveraging OpenZeppelin's libraries for security and reliability. It includes a factory pattern that allows users to create multiple custom tokens.

Installation and Setup


Clone the repository:

bash
Copy
Edit
git clone https://github.com/hashkhan0/token-forge.git
cd token-forge
Install dependencies:
bash
Copy
Edit
npm install
Create a .env file with your Firebase configuration and other environment variables.

Start the development server:

bash
Copy
Edit
npm start

Deployment

The dApp is deployed on Netlify for a seamless and fast user experience.





