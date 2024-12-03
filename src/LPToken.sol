// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin-contracts-5.1.0/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin-contracts-5.1.0/access/Ownable.sol";

contract LPToken is ERC20, Ownable {
    mapping(address => bool) public validPairs;

    address public factory;

    event FactorySet(address indexed factory);
    event PairAdded(address indexed pair);
    event PairRemoved(address indexed pair);

    constructor(address _factory) ERC20("Liquidity Provider Token", "LPT") Ownable(msg.sender) {
        require(_factory != address(0), "LPToken: ZERO_ADDRESS");
        factory = _factory;
        transferOwnership(_factory);
    }

    modifier onlyValidPair() {
        require(validPairs[msg.sender], "LPToken: UNAUTHORIZED");
        _;
    }

    function addValidPair(address pair) external onlyOwner {
        require(pair != address(0), "LPToken: ZERO_ADDRESS");
        require(!validPairs[pair], "LPToken: ALREADY_VALID");
        validPairs[pair] = true;
        emit PairAdded(pair);
    }

    function removeValidPair(address pair) external onlyOwner {
        require(pair != address(0), "LPToken: ZERO_ADDRESS");
        require(validPairs[pair], "LPToken: NOT_VALID");
        validPairs[pair] = false;
        emit PairRemoved(pair);
    }

    function mint(address to, uint256 amount) external onlyValidPair {
        require(to != address(0), "LPToken: MINT_TO_ZERO_ADDRESS");
        require(amount > 0, "LPToken: INVALID_AMOUNT");
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyValidPair {
        require(from != address(0), "LPToken: BURN_FROM_ZERO_ADDRESS");
        require(amount > 0, "LPToken: INVALID_AMOUNT");
        _burn(from, amount);
    }
}
