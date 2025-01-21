// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin-contracts-5.1.0/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin-contracts-5.1.0/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin-contracts-5.1.0/utils/ReentrancyGuard.sol";
import {Pair} from "./Pair.sol";
import {IPair} from "./interfaces/IPair.sol";
import {IFactory} from "./interfaces/IFactory.sol";
import {console} from "forge-std-1.9.4/src/console.sol";

contract Router is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public immutable factory;

    constructor(address _factory) {
        require(_factory != address(0), "Router: INVALID_FACTORY_ADDRESS");
        factory = _factory;
    }

    function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB)
        external
        nonReentrant
        returns (uint256 liquidityAdded)
    {
        require(tokenA != tokenB, "Router: IDENTICAL_ADDRESSES");
        require(tokenA != address(0) && tokenB != address(0), "Router: ZERO_ADDRESS");

        require(amountA > 0, "Amount0 must be greater than zero");
        require(amountB > 0, "Amount1 must be greater than zero");

        address pair = IFactory(factory).getPair(tokenA, tokenB);

        if (pair == address(0)) {
            pair = IFactory(factory).createPair(tokenA, tokenB);
        }

        IERC20(tokenA).safeTransferFrom(msg.sender, pair, amountA);
        IERC20(tokenB).safeTransferFrom(msg.sender, pair, amountB);

        liquidityAdded = IPair(pair).addLiquidity(msg.sender, amountA, amountB);
    }

    function removeLiquidity(address token0, address token1, uint256 liquidityAmount)
        external
        nonReentrant
        returns (uint256 amount0, uint256 amount1)
    {
        address pair = IFactory(factory).getPair(token0, token1);
        (amount0, amount1) = IPair(pair).removeLiquidity(msg.sender, liquidityAmount);
    }

    function swapExactTokensForTokens(
        address token0,
        address token1,
        uint256 amountIn,
        uint256 minAmountOut,
        uint256 deadline
    ) external nonReentrant returns (uint256 amountOut) {
        require(block.timestamp <= deadline, "Router: EXPIRED");

        address pair = IFactory(factory).getPair(token0, token1);

        amountOut = IPair(pair).swap(amountIn, token1, msg.sender, minAmountOut);
    }

    function getAmountOut(address pair, uint256 amountIn, address tokenOut, uint256 fee)
        external
        view
        returns (uint256 amountOut)
    {
        Pair pairContract = Pair(pair);

        address tokenIn = tokenOut == pairContract.tokenA() ? pairContract.tokenB() : pairContract.tokenA();

        uint256 reserveIn = tokenIn == pairContract.tokenA() ? pairContract.reserveA() : pairContract.reserveB();

        uint256 reserveOut = tokenOut == pairContract.tokenA() ? pairContract.reserveA() : pairContract.reserveB();

        uint256 amountInWithFee = amountIn * (100 - fee); // 0.3% fee
        amountOut = (amountInWithFee * reserveOut) / (reserveIn * 1000 + amountInWithFee);
    }

    function transferTokens(address token, address from, address to, uint256 amount) external nonReentrant {
        IERC20(token).safeTransferFrom(from, to, amount);
    }

    function getPairInfo(address token0, address token1)
        external
        view
        returns (
            address pair,
            address _tokenA,
            address _tokenB,
            uint256 _reserveA,
            uint256 _reserveB,
            uint256 _totalLiquidity,
            address _lpToken
        )
    {
        pair = IFactory(factory).getPair(token0, token1);
        require(pair != address(0), "Router: PAIR_NOT_EXIST");

        (_tokenA, _tokenB, _reserveA, _reserveB, _totalLiquidity, _lpToken) = IPair(pair).getPoolInfo();
        return (pair, _tokenA, _tokenB, _reserveA, _reserveB, _totalLiquidity, _lpToken);
    }

    function getAllPairsWithInfo()
        external
        view
        returns (
            address[] memory pairs,
            address[] memory token0s,
            address[] memory token1s,
            uint256[] memory reserves0,
            uint256[] memory reserves1,
            uint256[] memory totalLiquidities
        )
    {
        uint256 length = IFactory(factory).allPairsLength();

        pairs = new address[](length);
        token0s = new address[](length);
        token1s = new address[](length);
        reserves0 = new uint256[](length);
        reserves1 = new uint256[](length);
        totalLiquidities = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            address pair = IFactory(factory).allPairs(i);
            pairs[i] = pair;

            (token0s[i], token1s[i], reserves0[i], reserves1[i], totalLiquidities[i],) = IPair(pair).getPoolInfo();
        }

        return (pairs, token0s, token1s, reserves0, reserves1, totalLiquidities);
    }
}
