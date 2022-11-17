import hre, { ethers } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import poolABI from '../contracts/ABI/UniswapV2.json';
import routerABI from '../contracts/ABI/UniswapV2Router.json';
import ERC20ABI from '../contracts/ABI/ERC20.json';



describe("Sandwich Attack", () => {
    let pool: Contract;
    let reserves: { _reserve1: any; _reserve0: any; };
    let router: Contract;
    let user: SignerWithAddress;
    let victim: SignerWithAddress;
    let usdc: Contract;
    let weth: Contract;
    let swapUsdcAmount: any;

    let uniswapPoolAddress = '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc'
    let uniswapRouterAddress = '0xf164fC0Ec4E93095b804a4795bBe1e041497b92a'
    let wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
    let usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    let victimAddrrss = '0x70B8753DFC2095d6Df00806cD820c5c73CcB44f7'
    let victimSwapEthAmount = ethers.utils.parseEther("50.0")
    let victimMinReceiveAmount = 9349233457
    let uniswapFee = 997
    let BPS = 10000;

    // This is the frontrun amount you should calculate
    let frontrunAmount = 0;

    before(async () => {
        // Prepare contract
        pool = await ethers.getContractAt(poolABI, uniswapPoolAddress)
        usdc = await ethers.getContractAt(ERC20ABI, usdcAddress)
        weth = await ethers.getContractAt(ERC20ABI, wethAddress)
        let accounts = await ethers.getSigners()
        user = accounts[0]
        router = await ethers.getContractAt(routerABI, uniswapRouterAddress)
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [victimAddrrss],
        });
        victim = await ethers.getSigner(
            victimAddrrss
        );
    })

    it("Get pool reserve", async () => {
        // Get pool reserve data before sandwich
        reserves = await pool.getReserves()
        console.log('pool reserves', reserves)
    });

    it('Calculate victim allowed slippage', async () => {
        // You should calculate how much slippage the victum tx allowed 
    })

    it('Calculate max frontrun amount', async () => {
        // You should calculate how much ETH amount can you frontrun
    })

    it('Frontrun', async () => {
        let userUsdcBalanceBefore = await usdc.balanceOf(user.address)
        await router.connect(user).swapExactETHForTokens(
            0, // amountOutMin
            [wethAddress, usdcAddress], //path
            user.address, // to
            1590085691, // deadline
            {
                value: frontrunAmount,
            }
        )
        let userUsdcBalanceAfter = await usdc.balanceOf(user.address)
        swapUsdcAmount = userUsdcBalanceAfter.sub(userUsdcBalanceBefore)
        console.log('USDC swap amount', swapUsdcAmount)
    })

    it('Victim tx', async () => {
        await router.connect(victim).swapExactETHForTokens(
            victimMinReceiveAmount, // amountOutMin
            [wethAddress, usdcAddress], //path
            victimAddrrss, // to
            1590085691, // deadline
            {
                value: victimSwapEthAmount,
            }
        )
    })

    it('sandwich attack success', async () => {
        let userWethBalanceBefore = await weth.balanceOf(user.address)
        await usdc.connect(user).approve(router.address, swapUsdcAmount)
        await router.connect(user).swapExactTokensForTokens(
            swapUsdcAmount, // amountIn
            0, // amountOutMin
            [usdcAddress, wethAddress], //path
            user.address, // to
            1590085691 // deadline
        )
        let userWethBalanceAfter = await weth.balanceOf(user.address)
        let swapWethAmount = userWethBalanceAfter.sub(userWethBalanceBefore)
        let profit = swapWethAmount.sub(frontrunAmount)
        console.log('profit in ETH', ethers.utils.formatEther(profit))
        expect(ethers.utils.formatEther(profit), 'Profit should greater than 0.2 ETH').gt(0.2)
    })
});