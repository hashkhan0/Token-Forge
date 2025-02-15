// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract TokenFactory {
    event TokenCreated(address indexed tokenAddress, address indexed owner);
    
    mapping(address => address[]) public ownerToTokens;
    
    // Add event for debugging
    event DebugGetTokens(address owner, uint256 tokenCount);

    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) public {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");
        require(initialSupply > 0, "Initial supply must be positive");
        
        CustomToken newToken = new CustomToken(name, symbol, initialSupply, msg.sender);
        ownerToTokens[msg.sender].push(address(newToken));
        emit TokenCreated(address(newToken), msg.sender);
    }

    function getTokensByOwner(address owner) external view returns (address[] memory) {
        require(owner != address(0), "Invalid owner address");
        
        // Emit debug event (only works in non-view functions)
        // emit DebugGetTokens(owner, ownerToTokens[owner].length);
        
        return ownerToTokens[owner];
    }

    // Add function to check token count
    function getTokenCount(address owner) external view returns (uint256) {
        return ownerToTokens[owner].length;
    }
}

contract CustomToken is ERC20, ERC20Burnable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner
    ) ERC20(name, symbol) {
        _mint(owner, initialSupply * 10 ** decimals());
    }
}
