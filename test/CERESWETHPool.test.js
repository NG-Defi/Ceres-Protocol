const BigNumber = require('bignumber.js');
const BN = BigNumber.clone({ DECIMAL_PLACES: 9 })
const chalk = require('chalk');
const { assert, expect,chai} = require('chai');
const { expectEvent, send, shouldFail, time, constants, balance} = require('@openzeppelin/test-helpers');

const CEREStable = artifacts.require("Ceres/CEREStable");
const CEREShares = artifacts.require("CSS/CEREShares");
const Pool_USDC = artifacts.require("Ceres/Pools/Pool_USDC");
const UniswapPairOracle_USDC_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_USDC_WETH");
const WETH = artifacts.require("ERC20/WETH");
const FakeCollateral_USDC = artifacts.require("FakeCollateral/FakeCollateral_USDC");
const StakingRewards_CERES_WETH = artifacts.require("Staking/Variants/Stake_CERES_WETH.sol");
const UniswapV2Factory = artifacts.require("Uniswap/UniswapV2Factory");
const UniswapV2Pair = artifacts.require("Uniswap/UniswapV2Pair");
const Boardroom = artifacts.require('Boardroom');
const UniswapV2Router02_Modified = artifacts.require("Uniswap/UniswapV2Router02_Modified");
const UniswapPairOracle_CERES_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_CERES_WETH");
const ERC20 = artifacts.require("ERC20");
const BOND = artifacts.require("Bond");
// const CeresDemo = artifacts.require("Ceres/CeresDemo");
const ONE_DEC18 = new BigNumber("1e18");
const ONE_HUNDRED_DEC18 = new BigNumber("100e18");
const EIGHT_HUNDRED_DEC18 = new BigNumber("800e18");
const ONE_MILLION_DEC18 = new BigNumber("1000000e18");
const ONE_HUNDRED_MILLION_DEC18 = new BigNumber("100000000e18");
const FIVE_MILLION_DEC18 = new BigNumber("5000000e18");
const POINT_ONE_DEC18 = new BigNumber("0.1e18"); //0.1_dec18
const POINT_THREE_DEC18 = new BigNumber("0.3e18"); //0.3_dec18
const BIG6 = new BigNumber("1e6");
const BIG18 = new BigNumber("1e18");
const Treasury = artifacts.require('Treasury');
const CERESWETHPool = artifacts.require('Ceres/Pools/CERESWETHPool');
const SimpleFund = artifacts.require('SimpleERCFund');

contract('contracts/Ceres/Pools/CERESWETHPool.sol', async (accounts) => {
    // set the deploy address
	const account0 = accounts[0];
	const account1 = accounts[1];
	const account2 = accounts[2];
	const account3 = accounts[3];
    const account4 = accounts[4];
    const account5 = accounts[5];
    const account6 = accounts[6];
    const account7 = accounts[7];

    const OWNER = account0;
	const ADMIN = account1;
    const TEST_ACCOUNT = account7;

    let cssInstance;
    let ceresInstance;
    let bondInstance;
    let instance_Pool_USDC;
    let instance_Pool_USDC_collateral_token;
    let col_instance_USDC;
    let instanceStakingRewards_CERES_WETH;
    let pair_addr_CERES_WETH;
    let pair_instance_CERES_WETH;
    let wethInstance;
    let uniswapFactoryInstance;
    let ceresDemoInstance;
    let routerInstance;
    let boardroomInstance;
    let treasuryInstance;
    let simpleFundInstance;
    let oracle_instance_CERES_WETH;
    let ceresWethPoolInstance;
    beforeEach(async() => {
        cssInstance = await CEREShares.deployed();
        ceresInstance = await CEREStable.deployed();
        instance_Pool_USDC = await Pool_USDC.deployed();
        wethInstance = await WETH.deployed();
        bondInstance = await BOND.deployed();

        uniswapFactoryInstance = await UniswapV2Factory.deployed(); 
        routerInstance = await UniswapV2Router02_Modified.deployed(); 
        instance_Pool_USDC_collateral_token = await ERC20.at(await instance_Pool_USDC.collateral_token());
        instance_Pool_USDC_CERES = await CEREStable.at(await instance_Pool_USDC.CERES());
        instance_Pool_USDC_CSS = await CEREShares.at(await instance_Pool_USDC.CSS());
        col_instance_USDC = await FakeCollateral_USDC.deployed(); 
        instanceStakingRewards_CERES_WETH = await StakingRewards_CERES_WETH.deployed();
        pair_addr_CERES_WETH = await uniswapFactoryInstance.getPair(ceresInstance.address, wethInstance.address, { from: OWNER });
        pair_instance_CERES_WETH = await UniswapV2Pair.at(pair_addr_CERES_WETH);
        // ceresDemoInstance = await CeresDemo.deployed();
        boardroomInstance = await Boardroom.deployed();
        oracle_instance_CERES_WETH = await UniswapPairOracle_CERES_WETH.deployed();

        simpleFundInstance = await SimpleFund.deployed();
        treasuryInstance = await Treasury.deployed();
        ceresWethPoolInstance = await CERESWETHPool.deployed();
    });

    it('check ceresWethPoolInstance.address, its value is not be empty', async () => {
        console.log(chalk.blue(`ceresWethPoolInstance: ${await ceresWethPoolInstance.address}`));
        expect(ceresWethPoolInstance.address).to.not.be.empty;
    });

    it('check ceresWethPoolInstance.ceres.call(), its DEFAULT value is ceresInstance.address', async () => {
        const EXPECTED_VALUE = ceresInstance.address;
        expect(await ceresWethPoolInstance.ceres.call()).to.equal(EXPECTED_VALUE);
    });

    it('check ceresWethPoolInstance.DURATION.call(), its DEFAULT value is 5 * 86400', async () => {
        const EXPECTED_VALUE = new BigNumber(5 * 86400); // 5 DAYS
        expect(parseFloat(await ceresWethPoolInstance.DURATION.call())).to.equal(parseFloat(EXPECTED_VALUE));
    });

    it('check ceresWethPoolInstance.startime.call(), its DEFAULT value is 1616385600', async () => {
        const EXPECTED_VALUE = new BigNumber("1616385600");
        expect(parseFloat(await ceresWethPoolInstance.startime.call())).to.equal(parseFloat(EXPECTED_VALUE));
    });

    it('check ceresWethPoolInstance.periodFinish.call(), its DEFAULT value is 0', async () => {
        const EXPECTED_VALUE = new BigNumber("0");
        expect(parseFloat(await ceresWethPoolInstance.periodFinish.call())).to.equal(parseFloat(EXPECTED_VALUE));
    });

    it('check ceresWethPoolInstance.rewardRate.call(), its DEFAULT value is 0', async () => {
        const EXPECTED_VALUE = new BigNumber("0");
        expect(parseFloat(await ceresWethPoolInstance.rewardRate.call())).to.equal(parseFloat(EXPECTED_VALUE));
    });

    it('check ceresWethPoolInstance.rewardPerTokenStored.call(), its DEFAULT value is 0', async () => {
        const EXPECTED_VALUE = new BigNumber("0");
        expect(parseFloat(await ceresWethPoolInstance.rewardPerTokenStored.call())).to.equal(parseFloat(EXPECTED_VALUE));
    });

    it('check ceresWethPoolInstance.weth.call(), its DEFAULT value is wethInstance.address', async () => {
        const EXPECTED_VALUE = wethInstance.address;
        expect(await ceresWethPoolInstance.weth.call()).to.equal(EXPECTED_VALUE);
    });

    it('check ceresWethPoolInstance.totalSupply.call(), its DEFAULT value is 0', async () => {
        // console.log(parseFloat(await ceresWethPoolInstance.totalSupply.call()));
        const EXPECTED_VALUE = new BigNumber("0");
        expect(parseFloat(await ceresWethPoolInstance.totalSupply.call())).to.equal(parseFloat(EXPECTED_VALUE));
    });

    it('check ceresWethPoolInstance.balanceOf.call(account0/1/2/3/4/5/6/7), its DEFAULT value is 0', async () => {
        const EXPECTED_VALUE = new BigNumber("0");
        expect(parseFloat(await ceresWethPoolInstance.balanceOf.call(account0))).to.equal(parseFloat(EXPECTED_VALUE));
        expect(parseFloat(await ceresWethPoolInstance.balanceOf.call(account1))).to.equal(parseFloat(EXPECTED_VALUE));
        expect(parseFloat(await ceresWethPoolInstance.balanceOf.call(account2))).to.equal(parseFloat(EXPECTED_VALUE));
        expect(parseFloat(await ceresWethPoolInstance.balanceOf.call(account3))).to.equal(parseFloat(EXPECTED_VALUE));
        expect(parseFloat(await ceresWethPoolInstance.balanceOf.call(account4))).to.equal(parseFloat(EXPECTED_VALUE));
        expect(parseFloat(await ceresWethPoolInstance.balanceOf.call(account5))).to.equal(parseFloat(EXPECTED_VALUE));
        expect(parseFloat(await ceresWethPoolInstance.balanceOf.call(account6))).to.equal(parseFloat(EXPECTED_VALUE));
        expect(parseFloat(await ceresWethPoolInstance.balanceOf.call(account7))).to.equal(parseFloat(EXPECTED_VALUE));
    });

    it('check ceresWethPoolInstance.stake(one_dec18,{from: owner}) & withdraw()', async() => {
        // BEFORE
        console.log(chalk.yellow(`BEFORE: wethInstance.balanceOf.call(OWNER): ${await wethInstance.balanceOf.call(OWNER)}`))
        console.log(chalk.yellow(`BEFORE: wethInstance.balanceOf.call(ceresWethPoolInstance): ${new BigNumber(await wethInstance.balanceOf.call(ceresWethPoolInstance.address)).div(BIG18)}`));

        // ACTION
        await ceresWethPoolInstance.stake(ONE_DEC18,{from: OWNER});

        // AFTER
        console.log(chalk.yellow(`AFTER: wethInstance.balanceOf.call(OWNER): ${await wethInstance.balanceOf.call(OWNER)}`))
        console.log(chalk.yellow(`AFTER: wethInstance.balanceOf.call(ceresWethPoolInstance): ${new BigNumber(await wethInstance.balanceOf.call(ceresWethPoolInstance.address)).div(BIG18)}`));

        await ceresWethPoolInstance.withdraw(POINT_ONE_DEC18,{from: OWNER});

        // AFTER && AFTER
        console.log(chalk.yellow(`AFTER && AFTER: wethInstance.balanceOf.call(OWNER): ${await wethInstance.balanceOf.call(OWNER)}`))
        console.log(chalk.yellow(`AFTER && AFTER: wethInstance.balanceOf.call(ceresWethPoolInstance): ${new BigNumber(await wethInstance.balanceOf.call(ceresWethPoolInstance.address)).div(BIG18)}`));

    });

    it('check ceresWethPoolInstance.lastTimeRewardApplicable.call(), its DEFAULT value is gt [0]', async () => {
        const EXPECTED_VALUE = new BigNumber("0");
        expect(parseFloat(await ceresWethPoolInstance.lastTimeRewardApplicable.call())).to.gt(parseFloat(EXPECTED_VALUE));
    });

    it('check ceresWethPoolInstance.rewardPerToken.call(), its DEFAULT value is [0]', async () => {
        console.log(chalk.blue(`rewardPerToken: ${await ceresWethPoolInstance.rewardPerToken.call()}`));
        console.log(chalk.blue(`totalSupply: ${new BigNumber(await ceresWethPoolInstance.totalSupply.call()).div(BIG18)}`));
        const EXPECTED_VALUE = new BigNumber("0");
        expect(parseFloat(await ceresWethPoolInstance.rewardPerToken.call())).to.equal(parseFloat(EXPECTED_VALUE));
    });

    it('check ceresWethPoolInstance.setRewardRate(NEW_VALUE,{from: OWNER})', async () => {
        const DEFAULT_VALUE = new BigNumber("0");
        const NEW_VALUE =  new BigNumber("10");;
        // BEFORE
        expect(parseFloat(await ceresWethPoolInstance.rewardRate.call())).to.equal(parseFloat(DEFAULT_VALUE));
        // ACTION && ASSERTION
        await ceresWethPoolInstance.setRewardRate(NEW_VALUE,{from: OWNER});
        expect(parseFloat(await ceresWethPoolInstance.rewardRate.call())).to.equal(parseFloat(NEW_VALUE));

        // // ROLLBACK CODE
        await ceresWethPoolInstance.setRewardRate(DEFAULT_VALUE,{from: OWNER});
        expect(parseFloat(await ceresWethPoolInstance.rewardRate.call())).to.equal(parseFloat(DEFAULT_VALUE));
    });

    it('check ceresWethPoolInstance.rewardPerToken.call(), AFTER SETREWARDRATE()', async () => {
        console.log(chalk.yellow(`rewardPerToken_BEFORE: ${await ceresWethPoolInstance.rewardPerToken.call()}`));
        const EXPECTED_VALUE = new BigNumber("0");
        expect(parseFloat(await ceresWethPoolInstance.rewardPerToken.call())).to.equal(parseFloat(EXPECTED_VALUE));

        console.log(chalk.yellow(`lastUpdateTime: ${await ceresWethPoolInstance.lastUpdateTime.call()}`));
        console.log(chalk.yellow(`periodFinish: ${await ceresWethPoolInstance.periodFinish.call()}`));

        const NEW_VALUE =  ONE_DEC18;
        await ceresWethPoolInstance.setRewardRate(NEW_VALUE,{from: OWNER});
        console.log(chalk.blue(`lastUpdateTime_AFTER: ${await ceresWethPoolInstance.lastUpdateTime.call()}`));
        console.log(chalk.blue(`periodFinish_AFTER: ${await ceresWethPoolInstance.periodFinish.call()}`));

        console.log(chalk.blue(`rewardPerToken_AFTER: ${new BigNumber(await ceresWethPoolInstance.rewardPerToken.call()).div(BIG18)}`));
        // console.log(chalk.blue(`tmpValue: ${await ceresWethPoolInstance.tmpValue.call()}`));
    });

    it('check ceresWethPoolInstance.rewardPerToken.call() 2, AFTER SETREWARDRATE()', async () => {
        const NEW_VALUE =  1;
        await ceresWethPoolInstance.setRewardRate(NEW_VALUE,{from: OWNER});
        const EXPECTED_VALUE = new BigNumber("480000");
        expect(parseFloat(await ceresWethPoolInstance.rewardPerToken.call())).to.equal(parseFloat(EXPECTED_VALUE));
    });

    it('check ceresWethPoolInstance.earned.call(OWNER), its value is gt(0) & call(account1/2/3/4/5/6/7) = 0', async () => {
        console.log(chalk.blue(`balanceOf(OWNER): ${await ceresWethPoolInstance.balanceOf.call(OWNER)}`));
        console.log(chalk.blue(`earned(OWNER): ${await ceresWethPoolInstance.earned.call(OWNER)}`));

        const EXPECTED_VALUE = new BigNumber("432000");
        expect(parseFloat(await ceresWethPoolInstance.earned.call(OWNER))).to.equal(parseFloat(EXPECTED_VALUE));
        expect(parseFloat(await ceresWethPoolInstance.earned.call(account1))).to.equal(parseFloat(0));
        expect(parseFloat(await ceresWethPoolInstance.earned.call(account2))).to.equal(parseFloat(0));
        expect(parseFloat(await ceresWethPoolInstance.earned.call(account3))).to.equal(parseFloat(0));
        expect(parseFloat(await ceresWethPoolInstance.earned.call(account4))).to.equal(parseFloat(0));
        expect(parseFloat(await ceresWethPoolInstance.earned.call(account5))).to.equal(parseFloat(0));
        expect(parseFloat(await ceresWethPoolInstance.earned.call(account6))).to.equal(parseFloat(0));
        expect(parseFloat(await ceresWethPoolInstance.earned.call(account7))).to.equal(parseFloat(0));
    });

    it('check ceresWethPoolInstance.getReward({from: OWNER})', async () => {
        console.log(chalk.blue(`BEFORE: ceresInstance.balanceOf.call(OWNER): ${await ceresInstance.balanceOf.call(OWNER)}`));
        await ceresWethPoolInstance.getReward({from: OWNER});
        
        console.log(chalk.blue(`AFTER: ceresInstance.balanceOf.call(OWNER): ${await ceresInstance.balanceOf.call(OWNER)}`));
    });

    it('check ceresWethPoolInstance.exit({from: OWNER})', async () => {
        console.log(chalk.blue(`BEFORE: ceresInstance.balanceOf.call(OWNER): ${await ceresInstance.balanceOf.call(OWNER)}`));
        await ceresWethPoolInstance.exit({from: OWNER});
        
        console.log(chalk.blue(`AFTER: ceresInstance.balanceOf.call(OWNER): ${await ceresInstance.balanceOf.call(OWNER)}`));
    });

});
