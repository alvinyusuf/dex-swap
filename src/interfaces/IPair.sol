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

    function getPoolInfo()
        external
        view
        returns (
            address _tokenA,
            address _tokenB,
            uint256 _reserveA,
            uint256 _reserveB,
            uint256 _totalLiquidity,
            address _lpToken
        );

    function getUserLiquidity(address user) external view returns (uint256);

    function getCurrentPrice() external view returns (uint256 priceAtoB, uint256 priceBtoA);

    function getTokenDecimals() external view returns (uint8 decimalsA, uint8 decimalsB);

    function allPairsLength() external view returns (uint256);
}
