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
const ERC20 = artifacts.require("ERC20");
const ONE_DEC18 = new BigNumber("1e18");
const ONE_HUNDRED_DEC18 = new BigNumber("100e18");
const ONE_MILLION_DEC18 = new BigNumber("1000000e18");
const ONE_HUNDRED_MILLION_DEC18 = new BigNumber("100000000e18");
const TWO_MILLION_DEC18 = new BigNumber("2000000e18");
const POINT_ONE_DEC18 = new BigNumber("1e17"); //0.1_dec18
const POINT_THREE_DEC18 = new BigNumber("3e17"); //0.3_dec18
const FIVE_MILLION_DEC18 = new BigNumber("5000000e18");
const BIG6 = new BigNumber("1e6");
const BIG18 = new BigNumber("1e18");

contract('contracts/Staking/Variants/Stake_CERES_WETH.sol TEST_CASES_P2', async (accounts) => {
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
    const STAKING_OWNER = account0;
	const ADMIN = account1;
    const TEST_ACCOUNT = account7;

    let cssInstance;
    let ceresInstance;
    let instance_Pool_USDC;
    let instance_Pool_USDC_collateral_token;
    let col_instance_USDC;
    let instanceStakingRewards_CERES_WETH;
    let pair_addr_CERES_WETH;
    let wethInstance;
    let uniswapFactoryInstance;
    let stakingTokenInstance;
    beforeEach(async() => {
        cssInstance = await CEREShares.deployed();
        ceresInstance = await CEREStable.deployed();
        instance_Pool_USDC = await Pool_USDC.deployed();
        wethInstance = await WETH.deployed();

        uniswapFactoryInstance = await UniswapV2Factory.deployed(); 
        instance_Pool_USDC_collateral_token = await ERC20.at(await instance_Pool_USDC.collateral_token());
        instance_Pool_USDC_CERES = await CEREStable.at(await instance_Pool_USDC.CERES());
        instance_Pool_USDC_CSS = await CEREShares.at(await instance_Pool_USDC.CSS());
        col_instance_USDC = await FakeCollateral_USDC.deployed(); 
        instanceStakingRewards_CERES_WETH = await StakingRewards_CERES_WETH.deployed();
        pair_addr_CERES_WETH = await uniswapFactoryInstance.getPair(ceresInstance.address, wethInstance.address, { from: OWNER });
        stakingTokenInstance = await UniswapV2Pair.at(pair_addr_CERES_WETH);
    });

    it('check instanceStakingRewards_CERES_WETH.address, its value is not be empty', async () => {
        // console.log(chalk.blue(`instanceStakingRewards_CERES_WETH: ${await instanceStakingRewards_CERES_WETH.address}`));
        expect(instanceStakingRewards_CERES_WETH.address).to.not.be.empty;
    });

    it ("check instanceStakingRewards_CERES_WETH.stake() FUNC", async() => {
		const stakingTokenInstance = await UniswapV2Pair.at(pair_addr_CERES_WETH);
		expect(await stakingTokenInstance.name()).to.equal("Uniswap V2");

		// BEFORE
        console.log(chalk.yellow(`address_account0: ${account0} value: ${await stakingTokenInstance.balanceOf.call(account0)}`));
		console.log(chalk.yellow(`address_account1: ${account1} value: ${await stakingTokenInstance.balanceOf.call(account1)}`));
		console.log(chalk.yellow(`stakingInstance_CERES_WETH: ${instanceStakingRewards_CERES_WETH.address} value: ${await stakingTokenInstance.balanceOf.call(instanceStakingRewards_CERES_WETH.address)}`));
		console.log(chalk.yellow(`address_account2: ${account2} value: ${await stakingTokenInstance.balanceOf.call(account2)}`));

        // INITIALIZE
		await instanceStakingRewards_CERES_WETH.initializeDefault({from: STAKING_OWNER});
		
        
		// ACTION -- STAKE
		await instanceStakingRewards_CERES_WETH.stake(POINT_THREE_DEC18,{from: account0});
        
		// AFTER
        console.log(chalk.red(`=============================== SEPERATOR AFTER ============================`));
		console.log(chalk.yellow(`address_account0: ${account0} value: ${await stakingTokenInstance.balanceOf.call(account0)}`));
		console.log(chalk.yellow(`address_account1: ${account1} value: ${await stakingTokenInstance.balanceOf.call(account1)}`));
		console.log(chalk.yellow(`stakingInstance_CERES_WETH: ${instanceStakingRewards_CERES_WETH.address} value: ${await stakingTokenInstance.balanceOf.call(instanceStakingRewards_CERES_WETH.address)}`));
		console.log(chalk.yellow(`address_account2: ${account2} value: ${await stakingTokenInstance.balanceOf.call(account2)}`));
	});

    it ("check instanceStakingRewards_CERES_WETH.stakeLocked() FUNC", async() => {
        const NEW_VALUE = POINT_THREE_DEC18;
        const NEW_VALUE2 = 864000; // 10 DAYS
		const stakingTokenInstance = await UniswapV2Pair.at(pair_addr_CERES_WETH);
		expect(await stakingTokenInstance.name()).to.equal("Uniswap V2");

		// BEFORE
        console.log(chalk.yellow(`address_account0: ${account0} value: ${await stakingTokenInstance.balanceOf.call(account0)}`));
		console.log(chalk.yellow(`address_account1: ${account1} value: ${await stakingTokenInstance.balanceOf.call(account1)}`));
		console.log(chalk.yellow(`stakingInstance_CERES_WETH: ${instanceStakingRewards_CERES_WETH.address} value: ${await stakingTokenInstance.balanceOf.call(instanceStakingRewards_CERES_WETH.address)}`));
		console.log(chalk.yellow(`address_account2: ${account2} value: ${await stakingTokenInstance.balanceOf.call(account2)}`));

        // INITIALIZE
		await instanceStakingRewards_CERES_WETH.initializeDefault({from: STAKING_OWNER});
		
		// ACTION -- STAKE
		await instanceStakingRewards_CERES_WETH.stakeLocked(NEW_VALUE,NEW_VALUE2,{from: account0});
        
		// AFTER
        console.log(chalk.red(`=============================== SEPERATOR AFTER ============================`));
		console.log(chalk.yellow(`address_account0: ${account0} value: ${await stakingTokenInstance.balanceOf.call(account0)}`));
		console.log(chalk.yellow(`address_account1: ${account1} value: ${await stakingTokenInstance.balanceOf.call(account1)}`));
		console.log(chalk.yellow(`stakingInstance_CERES_WETH: ${instanceStakingRewards_CERES_WETH.address} value: ${await stakingTokenInstance.balanceOf.call(instanceStakingRewards_CERES_WETH.address)}`));
		console.log(chalk.yellow(`address_account2: ${account2} value: ${await stakingTokenInstance.balanceOf.call(account2)}`));
	});

    it ("check instanceStakingRewards_CERES_WETH.withdraw() FUNC", async() => {
        const NEW_VALUE = POINT_ONE_DEC18;
		// BEFORE
        console.log(chalk.yellow(`address_account0: ${account0} value: ${await stakingTokenInstance.balanceOf.call(account0)}`));
		console.log(chalk.yellow(`address_account1: ${account1} value: ${await stakingTokenInstance.balanceOf.call(account1)}`));
		console.log(chalk.yellow(`stakingInstance_CERES_WETH: ${instanceStakingRewards_CERES_WETH.address} value: ${await stakingTokenInstance.balanceOf.call(instanceStakingRewards_CERES_WETH.address)}`));
		console.log(chalk.yellow(`address_account2: ${account2} value: ${await stakingTokenInstance.balanceOf.call(account2)}`));
        // INITIALIZE
		await instanceStakingRewards_CERES_WETH.initializeDefault({from: STAKING_OWNER});
		// ACTION
		await instanceStakingRewards_CERES_WETH.withdraw(NEW_VALUE,{from: account0});
		// AFTER
        console.log(chalk.red(`=============================== SEPERATOR AFTER ============================`));
		console.log(chalk.yellow(`address_account0: ${account0} value: ${await stakingTokenInstance.balanceOf.call(account0)}`));
		console.log(chalk.yellow(`address_account1: ${account1} value: ${await stakingTokenInstance.balanceOf.call(account1)}`));
		console.log(chalk.yellow(`stakingInstance_CERES_WETH: ${instanceStakingRewards_CERES_WETH.address} value: ${await stakingTokenInstance.balanceOf.call(instanceStakingRewards_CERES_WETH.address)}`));
		console.log(chalk.yellow(`address_account2: ${account2} value: ${await stakingTokenInstance.balanceOf.call(account2)}`));
	});

    it ('check instanceStakingRewards_CERES_WETH.lockedStakesOf(OWNER)', async() => {
        // before
        const LockedStake_0_before = (await instanceStakingRewards_CERES_WETH.lockedStakesOf.call(OWNER))[0];
        const LockedStake_1_before = (await instanceStakingRewards_CERES_WETH.lockedStakesOf.call(OWNER))[1];
        const LockedStake_2_before = (await instanceStakingRewards_CERES_WETH.lockedStakesOf.call(OWNER))[2];
        console.log(chalk.yellow(`LockedStake_0_before: ${LockedStake_0_before}`));
        console.log(chalk.yellow(`LockedStake_1_before: ${LockedStake_1_before}`));
        console.log(chalk.yellow(`LockedStake_2_before: ${LockedStake_2_before}`));

        // ACTION
        const NEW_VALUE = ONE_DEC18;
        const NEW_VALUE2 = 1209600; // 14 DAYS
        await instanceStakingRewards_CERES_WETH.stakeLocked(NEW_VALUE,NEW_VALUE2,{from: account0});

        // AFTER
        console.log(chalk.red(`=============================== SEPERATOR AFTER ============================`));
        const LockedStake_0_AFTER = (await instanceStakingRewards_CERES_WETH.lockedStakesOf.call(OWNER))[0];
        const LockedStake_1_AFTER = (await instanceStakingRewards_CERES_WETH.lockedStakesOf.call(OWNER))[1];
        const LockedStake_2_AFTER = (await instanceStakingRewards_CERES_WETH.lockedStakesOf.call(OWNER))[2];
        console.log(chalk.blue(`LockedStake_0_AFTER: ${LockedStake_0_AFTER}`));
        console.log(chalk.blue(`LockedStake_1_AFTER: ${LockedStake_1_AFTER}`));
        console.log(chalk.blue(`LockedStake_2_AFTER: ${LockedStake_2_AFTER}`));

        // ACTION AGAIN
        await instanceStakingRewards_CERES_WETH.stakeLocked(NEW_VALUE,NEW_VALUE2,{from: account0});

        // AFTER * 2
        console.log(chalk.red(`=============================== SEPERATOR AFTER * 2 ============================`));
        const LockedStake_0_AFTER_2 = (await instanceStakingRewards_CERES_WETH.lockedStakesOf.call(OWNER))[0];
        const LockedStake_1_AFTER_2 = (await instanceStakingRewards_CERES_WETH.lockedStakesOf.call(OWNER))[1];
        const LockedStake_2_AFTER_2 = (await instanceStakingRewards_CERES_WETH.lockedStakesOf.call(OWNER))[2];
        console.log(chalk.green(`LockedStake_0_AFTER_2: ${LockedStake_0_AFTER_2}`));
        console.log(chalk.green(`LockedStake_1_AFTER_2: ${LockedStake_1_AFTER_2}`));
        console.log(chalk.green(`LockedStake_2_AFTER_2: ${LockedStake_2_AFTER_2}`));
    })

    it ('check instanceStakingRewards_CERES_WETH.renewIfApplicable', async() => {
        // prepare & before
        const periodFinish_before = await instanceStakingRewards_CERES_WETH.periodFinish.call();
        console.log(chalk.blue(`periodFinish_before: ${periodFinish_before}`));

        const block_timestamp_before = await time.latest();
        console.log(chalk.blue(`block_timestamp_before: ${block_timestamp_before}`))

        await time.increase(1000000);

        const block_timestamp_after = await time.latest();
        console.log(chalk.blue(`block_timestamp_after: ${block_timestamp_after}`))
        // action
        await instanceStakingRewards_CERES_WETH.renewIfApplicable();
        // AFTER
        console.log(chalk.red(`=============================== SEPERATOR AFTER ============================`));
        console.log(chalk.blue(`periodFinish: ${await instanceStakingRewards_CERES_WETH.periodFinish.call()}`));
        console.log(chalk.blue(`rewardPerTokenStored: ${new BigNumber(await instanceStakingRewards_CERES_WETH.rewardPerTokenStored.call()).div(BIG18)}`));
        console.log(chalk.blue(`lastUpdateTime: ${await instanceStakingRewards_CERES_WETH.lastUpdateTime.call()}`));

        // ACTION:
        console.log(chalk.red(`=============================== SEPERATOR AFTER ============================`));
        console.log(chalk.yellow(`CSS.balanceOf(OWNER): ${new BigNumber(await cssInstance.balanceOf(OWNER)).div(BIG18)}`));
        
        await instanceStakingRewards_CERES_WETH.getReward({from:OWNER});
        console.log(chalk.blue(`CSS.balanceOf(OWNER): ${new BigNumber(await cssInstance.balanceOf(OWNER)).div(BIG18)}`));

    })


});
