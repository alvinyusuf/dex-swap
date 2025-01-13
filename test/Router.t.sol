// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.28;

// import {Test} from "forge-std-1.9.4/src/Test.sol";
// import {Router} from "../src/Router.sol";
// import {TestToken} from "../src/TestToken.sol";
// import {Factory} from "../src/Factory.sol";
// import {LPToken} from "../src/LPToken.sol";
// import {console} from "forge-std-1.9.4/src/console.sol";
// import {IPair} from "../src/interfaces/IPair.sol";
// import {IERC20} from "@openzeppelin-contracts-5.1.0/token/ERC20/IERC20.sol";

// contract RouterTest is Test {
//     Router public router;
//     Factory public factory;
//     LPToken public lpToken;
//     uint256 public liquidityAdded;

//     uint256 public totalLiquidtyAB;
//     uint256 public totalLiquidtyAC;
//     uint256 public totalLiquidtyBC;

//     uint256 public totalLPBalanceUser1;
//     uint256 public totalLPBalanceUser2;
//     uint256 public totalLPBalanceUser3;

//     TestToken public tokenA;
//     TestToken public tokenB;
//     TestToken public tokenC;

//     address public pairAB;
//     address public pairAC;
//     address public pairBC;

//     uint256 public ratioAB;
//     uint256 public ratioBA;
//     uint256 public ratioAC;
//     uint256 public ratioCA;
//     uint256 public ratioBC;
//     uint256 public ratioCB;

//     address public user1 = address(1);
//     address public user2 = address(2);
//     address public user3 = address(3);

//     uint256 public initialAmountTokenAUser1 = 1000000 * 10 ** 18;
//     uint256 public initialAmountTokenAUser2 = 1000000 * 10 ** 18;
//     uint256 public initialAmountTokenAUser3 = 1000000 * 10 ** 18;

//     uint256 public initialAmountTokenBUser1 = 1000000 * 10 ** 18;
//     uint256 public initialAmountTokenBUser2 = 1000000 * 10 ** 18;
//     uint256 public initialAmountTokenBUser3 = 1000000 * 10 ** 18;

//     uint256 public initialAmountTokenCUser1 = 1000000 * 10 ** 18;
//     uint256 public initialAmountTokenCUser2 = 1000000 * 10 ** 18;
//     uint256 public initialAmountTokenCUser3 = 1000000 * 10 ** 18;

//     uint256 public amountTokenAUser1 = 6 * 10 ** 18;
//     uint256 public amountTokenAUser2 = 2 * 10 ** 18;
//     uint256 public amountTokenAUser3 = 9 * 10 ** 18;

//     uint256 public amountTokenBUser1 = 7 * 10 ** 18;
//     uint256 public amountTokenBUser2 = 9 * 10 ** 18;
//     uint256 public amountTokenBUser3 = 4 * 10 ** 18;

//     uint256 public amountTokenCUser1 = 8 * 10 ** 18;
//     uint256 public amountTokenCUser2 = 3 * 10 ** 18;
//     uint256 public amountTokenCUser3 = 5 * 10 ** 18;

//     uint256 public balanceTokenAUser1;
//     uint256 public balanceTokenAUser2;
//     uint256 public balanceTokenAUser3;

//     uint256 public balanceTokenBUser1;
//     uint256 public balanceTokenBUser2;
//     uint256 public balanceTokenBUser3;

//     uint256 public balanceTokenCUser1;
//     uint256 public balanceTokenCUser2;
//     uint256 public balanceTokenCUser3;

//     function setUp() public {
//         tokenA = new TestToken("TokenA", "TTA", 500000000);
//         tokenB = new TestToken("TokenB", "TTB", 500000000);
//         tokenC = new TestToken("TokenC", "TTC", 500000000);

//         tokenA.transfer(user1, initialAmountTokenAUser1);
//         tokenA.transfer(user2, initialAmountTokenAUser2);
//         tokenA.transfer(user3, initialAmountTokenAUser3);

//         tokenB.transfer(user1, initialAmountTokenBUser1);
//         tokenB.transfer(user2, initialAmountTokenBUser2);
//         tokenB.transfer(user3, initialAmountTokenBUser3);

//         tokenC.transfer(user1, initialAmountTokenCUser1);
//         tokenC.transfer(user2, initialAmountTokenCUser2);
//         tokenC.transfer(user3, initialAmountTokenCUser3);

//         factory = new Factory();
//         lpToken = new LPToken(address(factory));
//         router = new Router(address(factory));

//         factory.setLPToken(address(lpToken));

//         vm.startPrank(user1);
//         console.log("-------------Pair AB-------------");

//         assertEq(
//             IERC20(tokenA).balanceOf(user1), initialAmountTokenAUser1, "Total tokenA balance of user1 is incorrect"
//         );
//         assertEq(
//             IERC20(tokenB).balanceOf(user1), initialAmountTokenBUser1, "Total tokenB balance of user1 is incorrect"
//         );

//         tokenA.approve(address(router), amountTokenAUser1);
//         tokenB.approve(address(router), amountTokenBUser1);

//         liquidityAdded = router.addLiquidity(address(tokenA), address(tokenB), amountTokenAUser1, amountTokenBUser1);
//         pairAB = factory.getPair(address(tokenA), address(tokenB));

//         totalLiquidtyAB += liquidityAdded;
//         totalLPBalanceUser1 += liquidityAdded;

//         uint256 tokenABalanceInPairContractAB = tokenA.balanceOf(pairAB);
//         uint256 tokenBBalanceInPairContractAB = tokenB.balanceOf(pairAB);

//         ratioAB = (tokenABalanceInPairContractAB * 10 ** 18) / tokenBBalanceInPairContractAB;
//         ratioBA = (tokenBBalanceInPairContractAB * 10 ** 18) / tokenABalanceInPairContractAB;

//         assertEq(
//             (tokenABalanceInPairContractAB * 10 ** 18) / tokenBBalanceInPairContractAB,
//             ratioAB,
//             "Ratio of tokenA to tokenB in Pair contract is incorrect"
//         );
//         assertEq(
//             (tokenBBalanceInPairContractAB * 10 ** 18) / tokenABalanceInPairContractAB,
//             ratioBA,
//             "Ratio of tokenB to tokenA in Pair contract is incorrect"
//         );

//         balanceTokenAUser1 = initialAmountTokenAUser1 - amountTokenAUser1;
//         balanceTokenBUser1 = initialAmountTokenBUser1 - amountTokenBUser1;

//         assertEq(IERC20(tokenA).balanceOf(user1), balanceTokenAUser1, "Total tokenA balance of user1 is incorrect");
//         assertEq(IERC20(tokenB).balanceOf(user1), balanceTokenBUser1, "Total tokenB balance of user1 is incorrect");

//         assertEq(totalLiquidtyAB, liquidityAdded, "Total liquidity added to Pair contract is incorrect");
//         assertEq(lpToken.balanceOf(user1), totalLPBalanceUser1, "Total LP balance of user1 is incorrect");

//         console.log("-------------Pair AC-------------");

//         assertEq(
//             IERC20(tokenA).balanceOf(user1),
//             initialAmountTokenAUser1 - amountTokenAUser1,
//             "Total tokenA balance of user1 is incorrect"
//         );
//         assertEq(
//             IERC20(tokenC).balanceOf(user1), initialAmountTokenBUser1, "Total tokenB balance of user1 is incorrect"
//         );

//         tokenA.approve(address(router), amountTokenAUser1);
//         tokenC.approve(address(router), amountTokenCUser1);

//         liquidityAdded = router.addLiquidity(address(tokenA), address(tokenC), amountTokenAUser1, amountTokenCUser1);
//         pairAC = factory.getPair(address(tokenA), address(tokenC));

//         totalLiquidtyAC += liquidityAdded;
//         totalLPBalanceUser1 += liquidityAdded;

//         uint256 tokenABalanceInPairContractAC = tokenA.balanceOf(pairAC);
//         uint256 tokenCBalanceInPairContractAC = tokenC.balanceOf(pairAC);

//         ratioAC = (tokenABalanceInPairContractAC * 10 ** 18) / tokenCBalanceInPairContractAC;
//         ratioCA = (tokenCBalanceInPairContractAC * 10 ** 18) / tokenABalanceInPairContractAC;

//         assertEq(
//             (tokenABalanceInPairContractAC * 10 ** 18) / tokenCBalanceInPairContractAC,
//             ratioAC,
//             "Ratio of tokenA to tokenC in Pair contract is incorrect"
//         );
//         assertEq(
//             (tokenCBalanceInPairContractAC * 10 ** 18) / tokenABalanceInPairContractAC,
//             ratioCA,
//             "Ratio of tokenC to tokenA in Pair contract is incorrect"
//         );

//         balanceTokenAUser1 = balanceTokenAUser1 - amountTokenAUser1;
//         balanceTokenCUser1 = initialAmountTokenCUser1 - amountTokenCUser1;

//         assertEq(IERC20(tokenA).balanceOf(user1), balanceTokenAUser1, "Total tokenA balance of user1 is incorrect");
//         assertEq(IERC20(tokenC).balanceOf(user1), balanceTokenCUser1, "Total tokenC balance of user1 is incorrect");

//         assertEq(totalLiquidtyAC, liquidityAdded, "Total liquidity added to Pair contract is incorrect");
//         assertEq(lpToken.balanceOf(user1), totalLPBalanceUser1, "Total LP balance of user1 is incorrect");

//         vm.stopPrank();
//     }

//     function testAddLiquidity() public {
//         vm.startPrank(user1);

//         console.log("-------------Pair BC-------------");

//         assertEq(
//             IERC20(tokenB).balanceOf(user1),
//             initialAmountTokenBUser1 - amountTokenBUser1,
//             "Total tokenB balance of user1 is incorrect"
//         );
//         assertEq(
//             IERC20(tokenC).balanceOf(user1),
//             initialAmountTokenCUser1 - amountTokenCUser1,
//             "Total tokenC balance of user1 is incorrect"
//         );

//         tokenB.approve(address(router), amountTokenBUser1);
//         tokenC.approve(address(router), amountTokenCUser1);

//         liquidityAdded = router.addLiquidity(address(tokenB), address(tokenC), amountTokenBUser1, amountTokenCUser1);
//         pairBC = factory.getPair(address(tokenB), address(tokenC));

//         totalLiquidtyBC += liquidityAdded;
//         totalLPBalanceUser1 += liquidityAdded;

//         uint256 tokenBBalanceInPairContractBC = tokenB.balanceOf(pairBC);
//         uint256 tokenCBalanceInPairContractBC = tokenC.balanceOf(pairBC);

//         ratioBC = (tokenBBalanceInPairContractBC * 10 ** 18) / tokenCBalanceInPairContractBC;
//         ratioCB = (tokenCBalanceInPairContractBC * 10 ** 18) / tokenBBalanceInPairContractBC;

//         assertEq(
//             (tokenBBalanceInPairContractBC * 10 ** 18) / tokenCBalanceInPairContractBC,
//             ratioBC,
//             "Ratio of tokenB to tokenC in Pair contract is incorrect"
//         );
//         assertEq(
//             (tokenCBalanceInPairContractBC * 10 ** 18) / tokenBBalanceInPairContractBC,
//             ratioCB,
//             "Ratio of tokenC to tokenB in Pair contract is incorrect"
//         );

//         balanceTokenBUser1 = balanceTokenBUser1 - amountTokenBUser1;
//         balanceTokenCUser1 = balanceTokenCUser1 - amountTokenCUser1;

//         assertEq(IERC20(tokenB).balanceOf(user1), balanceTokenBUser1, "Total tokenB balance of user1 is incorrect");
//         assertEq(IERC20(tokenC).balanceOf(user1), balanceTokenCUser1, "Total tokenC balance of user1 is incorrect");

//         assertEq(totalLiquidtyBC, liquidityAdded, "Total liquidity added to Pair contract is incorrect");
//         assertEq(lpToken.balanceOf(user1), totalLPBalanceUser1, "Total LP balance of user1 is incorrect");

//         vm.stopPrank();
//         vm.startPrank(user2);

//         console.log("-------------Pair AB-------------");

//         assertEq(
//             IERC20(tokenA).balanceOf(user2), initialAmountTokenAUser2, "Total tokenA balance of user2 is incorrect"
//         );
//         assertEq(
//             IERC20(tokenB).balanceOf(user2), initialAmountTokenBUser2, "Total tokenB balance of user2 is incorrect"
//         );

//         tokenA.approve(address(router), amountTokenAUser2);
//         tokenB.approve(address(router), amountTokenBUser2);

//         liquidityAdded = router.addLiquidity(address(tokenA), address(tokenB), amountTokenAUser2, amountTokenBUser2);

//         assertEq(pairAB, factory.getPair(address(tokenA), address(tokenB)), "Pair contract address is incorrect");

//         totalLiquidtyAB += liquidityAdded;
//         totalLPBalanceUser2 += liquidityAdded;

//         uint256 tokenABalanceInPairContractAB = tokenA.balanceOf(pairAB);
//         uint256 tokenBBalanceInPairContractAB = tokenB.balanceOf(pairAB);

//         assertEq((tokenABalanceInPairContractAB * 10 ** 18) / tokenBBalanceInPairContractAB, ratioAB);

//         assertEq(
//             (tokenABalanceInPairContractAB * 10 ** 18) / tokenBBalanceInPairContractAB,
//             ratioAB,
//             "Ratio of tokenA to tokenB in Pair contract is incorrect"
//         );
//         assertEq(
//             (tokenBBalanceInPairContractAB * 10 ** 18) / tokenABalanceInPairContractAB,
//             ratioBA,
//             "Ratio of tokenB to tokenA in Pair contract is incorrect"
//         );

//         balanceTokenAUser2 = initialAmountTokenAUser2 - amountTokenAUser2;
//         balanceTokenBUser2 = initialAmountTokenBUser2 - amountTokenBUser2;

//         assertEq(IERC20(tokenA).balanceOf(user2), balanceTokenAUser2, "Total tokenA balance of user2 is incorrect");

//         // TODO: Fix if amount of token not used in addLiquidity is must be returned to user and get the correct balance of tokenB of user
//         // assertEq(IERC20(tokenB).balanceOf(user2), balanceTokenBUser2, "Total tokenB balance of user2 is incorrect");

//         // TODO: Fix get correct balance of total liquidity in Pair contract and current liquidity added by user
//         // assertEq(totalLiquidtyAB, liquidityAdded, "Total liquidity added to Pair contract is incorrect");
//         assertEq(lpToken.balanceOf(user2), totalLPBalanceUser2, "Total LP balance of user2 is incorrect");

//         vm.stopPrank();
//     }

//     // function testRemoveLiquidity() public {
//     //     vm.startPrank(user1);

//     //     uint256 amount0 = 1000;
//     //     uint256 amount1 = 2;

//     //     tokenA.approve(address(router), amount0);
//     //     tokenB.approve(address(router), amount1);

//     //     uint256 liquidity = router.addLiquidity(
//     //         address(tokenA),
//     //         address(tokenB),
//     //         amount0,
//     //         amount1
//     //     );

//     //     console.log("Liquidity added: %d", liquidity);

//     //     uint256 lpBalance = lpToken.balanceOf(user1);
//     //     lpToken.approve(address(router), lpBalance);

//     //     uint256 token0BalanceBefore = tokenA.balanceOf(user1);
//     //     uint256 token1BalanceBefore = tokenB.balanceOf(user1);

//     //     console.log("Token0 balance before: %d", token0BalanceBefore);
//     //     console.log("Token1 balance before: %d", token1BalanceBefore);

//     //     router.removeLiquidity(
//     //         address(tokenA),
//     //         address(tokenB),
//     //         lpBalance
//     //     );

//     //     console.log("Token0 balance before: %d", tokenA.balanceOf(user1));
//     //     console.log("Token0 balance before: %d", tokenB.balanceOf(user1));

//     //     assert(tokenA.balanceOf(user1) > token0BalanceBefore);
//     //     assert(tokenB.balanceOf(user1) > token1BalanceBefore);

//     //     vm.stopPrank();
//     // }

//     // function testSwap() public {
//     //     vm.startPrank(user1);

//     //     uint256 amount0 = 100000;
//     //     uint256 amount1 = 90000;
//     //     uint256 amountSwap = 1000;

//     //     tokenA.approve(address(router), amount0);
//     //     tokenB.approve(address(router), amount1);

//     //     uint256 liquidity = router.addLiquidity(
//     //         address(tokenA),
//     //         address(tokenB),
//     //         amount0,
//     //         amount1
//     //     );

//     //     console.log("Liquidity added: %d", liquidity);

//     //     address pair = factory.getPair(address(tokenA), address(tokenB));
//     //     console.log("Token0 amount0: %d", IPair(pair).reserve0());
//     //     console.log("Token0 amount1: %d", IPair(pair).reserve1());

//     //     uint256 balanceBefore = tokenB.balanceOf(user1);

//     //     router.swapExactTokensForTokens(
//     //         address(tokenA),
//     //         address(tokenB),
//     //         amountSwap,
//     //         9,
//     //         block.timestamp + 1 minutes
//     //     );

//     //     uint256 balanceAfter = tokenB.balanceOf(user1);
//     //     assert(balanceAfter > balanceBefore);

//     //     vm.stopPrank();
//     // }
// }
