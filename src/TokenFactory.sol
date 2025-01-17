// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Token} from "./Token.sol";

contract TokenFactory {
    struct TokenInfo {
        address tokenAddress;
        address owner;
        uint256 initialSupply;
        string name;
        string symbol;
        uint256 creationTime;
    }

    address[] public tokenAddresses;
    mapping(address => TokenInfo) public tokenDetails;
    mapping(address => address[]) public ownerTokens;

    event TokenCreated(address indexed tokenAddress, address indexed owner, uint256 initialSupply);

    function createToken(address initialOwner, uint256 initialSupply, string memory name, string memory symbol)
        public
        returns (address)
    {
        Token newToken = new Token(name, symbol, initialSupply, initialOwner);
        address tokenAddress = address(newToken);

        TokenInfo memory tokenInfo = TokenInfo({
            tokenAddress: tokenAddress,
            owner: initialOwner,
            initialSupply: initialSupply,
            name: name,
            symbol: symbol,
            creationTime: block.timestamp
        });

        tokenAddresses.push(tokenAddress);
        tokenDetails[tokenAddress] = tokenInfo;
        ownerTokens[initialOwner].push(tokenAddress);

        emit TokenCreated(address(newToken), initialOwner, initialSupply);
        return address(newToken);
    }

    function getAllTokens() public view returns (address[] memory) {
        return tokenAddresses;
    }

    function getOwnerTokens(address owner) public view returns (address[] memory) {
        return ownerTokens[owner];
    }

    function getTokenInfo(address tokenAddress)
        public
        view
        returns (address owner, uint256 initialSupply, string memory name, string memory symbol, uint256 creationTime)
    {
        TokenInfo memory info = tokenDetails[tokenAddress];
        return (info.owner, info.initialSupply, info.name, info.symbol, info.creationTime);
    }
}
