// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IPair {
    function token0() external view returns (address);

    function token1() external view returns (address);

    function reserve0() external view returns (uint256);

    function reserve1() external view returns (uint256);

    function totalLiquidity() external view returns (uint256);

    function liquidity(address account) external view returns (uint256);

    function addLiquidity(address depositor, uint256 amountA, uint256 amountB)
        external
        returns (uint256 liquidityAdded);

    function removeLiquidity(address depoositor, uint256 liquidityAmount)
        external
        returns (uint256 amountA, uint256 amountB);

    function swap(uint256 amountIn, address tokenOut, address to, uint256 minAmountOut)
        external
        returns (uint256 amountOut);

    function sync() external;
}
