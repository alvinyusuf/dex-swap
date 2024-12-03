// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin-contracts-5.1.0/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin-contracts-5.1.0/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin-contracts-5.1.0/token/ERC20/utils/SafeERC20.sol";
import {Math} from "@openzeppelin-contracts-5.1.0/utils/math/Math.sol";
import {ILPToken} from "./interfaces/ILPToken.sol";
import {console} from "forge-std/console.sol";

contract Pair is ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public tokenA;
    address public tokenB;
    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public totalLiquidity;
    address public lpToken;
    mapping(address => uint256) public liquidity;

    event LiquidityRemoved(address indexed user, uint256 liquidity, uint256 amountA, uint256 amountB);

    event Swap(
        address indexed user,
        address indexed tokenIn,
        uint256 amountIn,
        address indexed tokenOut,
        uint256 amountOut,
        address to
    );

    constructor(address _tokenA, address _tokenB, address _lpToken) {
        if (_tokenA > _tokenB) (_tokenA, _tokenB) = (_tokenA, _tokenB);
        tokenA = _tokenA;
        tokenB = _tokenB;
        lpToken = _lpToken;
    }

    function addLiquidity(address depositor, uint256 amountA, uint256 amountB)
        external
        returns (uint256 liquidityAdded)
    {
        uint256 balance0 = IERC20(tokenA).balanceOf(address(this));
        uint256 balance1 = IERC20(tokenB).balanceOf(address(this));

        require(balance0 >= reserveA + amountA, "Pair: Insufficient tokenA");
        require(balance1 >= reserveB + amountB, "Pair: Insufficient tokenB");

        uint256 adjustedAmountA;
        uint256 adjustedAmountB;

        if (totalLiquidity == 0) {
            liquidityAdded = Math.sqrt(amountA * amountB);
            adjustedAmountA = amountA;
            adjustedAmountB = amountB;
        } else {
            adjustedAmountA = (amountB * reserveA) / reserveB;

            if (adjustedAmountA <= amountA) {
                adjustedAmountB = amountB;
            } else {
                adjustedAmountA = amountA;
                adjustedAmountB = (amountA * reserveB) / reserveA;
            }

            liquidityAdded = (adjustedAmountA * totalLiquidity) / reserveB;
        }

        require(liquidityAdded > 0, "Invalid liquidity amount");

        reserveA += adjustedAmountA;
        reserveB += adjustedAmountB;
        totalLiquidity += liquidityAdded;
        liquidity[depositor] += liquidityAdded;

        if (amountA > adjustedAmountA) {
            IERC20(tokenA).transfer(depositor, amountA - adjustedAmountA);
        }
        if (amountB > adjustedAmountB) {
            IERC20(tokenB).transfer(depositor, amountB - adjustedAmountB);
        }

        ILPToken(lpToken).mint(depositor, liquidityAdded);

        return liquidityAdded;
    }

    function removeLiquidity(address depositor, uint256 liquidityAmount)
        external
        nonReentrant
        returns (uint256 amountA, uint256 amountB)
    {
        require(liquidity[depositor] >= liquidityAmount, "Insufficient liquidity");

        amountA = (liquidityAmount * reserveA) / totalLiquidity;
        amountB = (liquidityAmount * reserveB) / totalLiquidity;

        require(amountA > 0 && amountB > 0, "Invalid amount");
        require(reserveA >= amountA && reserveB >= amountB, "Insufficient reserves");

        reserveA -= amountA;
        reserveB -= amountB;
        totalLiquidity -= liquidityAmount;
        liquidity[depositor] -= liquidityAmount;

        require(IERC20(tokenA).transfer(depositor, amountA), "Transfer of tokenA failed");
        require(IERC20(tokenB).transfer(depositor, amountB), "Transfer of tokenB failed");

        emit LiquidityRemoved(depositor, liquidityAmount, amountA, amountB);

        return (amountA, amountB);
    }

    function swap(uint256 amountIn, address tokenOut, address to, uint256 minAmountOut)
        external
        nonReentrant
        returns (uint256 amountOut)
    {
        require(tokenOut == tokenA || tokenOut == tokenB, "Invalid token");
        require(to != address(0), "Invalid recipient address");

        (address tokenIn, uint256 reserveIn, uint256 reserveOut) =
            tokenOut == tokenA ? (tokenB, reserveB, reserveA) : (tokenA, reserveA, reserveB);

        uint256 amountInWithFee = (amountIn * 997) / 1000; // 0.3% fee
        amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
        require(amountOut > 0, "Pair: Insufficient output amount");
        require(amountOut >= minAmountOut, "Pair: Slippage tolerance exceeded");

        require(IERC20(tokenOut).transfer(to, amountOut), "Pair: Transfer failed");

        _updateReserves();

        emit Swap(to, tokenIn, amountIn, tokenOut, amountOut, to);

        return amountOut;
    }

    function sync() external {
        _updateReserves();
    }

    function _updateReserves() internal {
        reserveA = IERC20(tokenA).balanceOf(address(this));
        reserveB = IERC20(tokenB).balanceOf(address(this));
    }
}
