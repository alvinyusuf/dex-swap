// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Pair} from "./Pair.sol";
import {ILPToken} from "./interfaces/ILPToken.sol";

contract Factory {
    event PairCreated(address indexed token0, address indexed token1, address pair);
    event LPTokenSet(address lpToken);

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;
    address public lpToken;

    modifier lpTokenSet() {
        require(lpToken != address(0), "Factory: LPToken not set");
        _;
    }

    function setLPToken(address _lpToken) external {
        require(lpToken == address(0), "Factory: LPToken already set");
        require(_lpToken != address(0), "Factory: INVALID_LPToken_ADDRESS");
        lpToken = _lpToken;
        emit LPTokenSet(lpToken);
    }

    function createPair(address token0, address token1) external lpTokenSet returns (address pair) {
        require(token0 != token1, "Factory: IDENTICAL_ADDRESSES");
        require(token0 != address(0) && token1 != address(0), "Factory: ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "Factory: PAIR_EXISTS");

        bytes memory bytecode = abi.encodePacked(type(Pair).creationCode, abi.encode(token0, token1, lpToken));
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));
        assembly {
            pair := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }

        require(pair != address(0), "Factory: PAIR_CREATION_FAILED");

        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);

        ILPToken(lpToken).addValidPair(pair);

        emit PairCreated(token0, token1, pair);
    }

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    function findPair(address tokenA, address tokenB) external view returns (address) {
        return getPair[tokenA][tokenB];
    }
}
