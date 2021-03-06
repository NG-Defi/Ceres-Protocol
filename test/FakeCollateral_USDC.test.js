const BigNumber = require('bignumber.js');
const BN = BigNumber.clone({ DECIMAL_PLACES: 9 })
const chalk = require('chalk');
const { assert, expect,chai} = require('chai');
const { expectEvent, send, shouldFail, time, constants, balance} = require('@openzeppelin/test-helpers');

const CEREStable = artifacts.require("Ceres/CEREStable");
const WETH = artifacts.require("ERC20/WETH");
const ChainlinkETHUSDPriceConsumerTest = artifacts.require("Oracle/ChainlinkETHUSDPriceConsumerTest");
const UniswapPairOracle_CERES_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_CERES_WETH");
const UniswapPairOracle_CSS_WETH = artifacts.require("Oracle/Variants/UniswapPairOracle_CSS_WETH");
const FakeCollateral_USDC = artifacts.require("FakeCollateral/FakeCollateral_USDC");

const BIG6 = new BigNumber("1e6");
const BIG18 = new BigNumber("1e18");
const ONE_MILLION_DEC18 = new BigNumber("1000000e18");
const SIX_HUNDRED_DEC6 = new BigNumber("600e6");
const EIGHT_HUNDRED_DEC6 = new BigNumber("800e6");
const ONE_HUNDRED_MILLION_DEC18 = new BigNumber("100000000e18");
const ONE_THOUSAND_DEC18 = new BigNumber("1000e18");
const TWO_THOUSAND_DEC18 = new BigNumber("2000e18");
const COLLATERAL_SEED_DEC18 = new BigNumber("500000e18");


contract('contracts/FakeCollateral/FakeCollateral_USDC.sol', async (accounts) => {

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
    let instanceCERES;
    let instanceOracle_chainlink_ETH_USD
    let wethInstance;
    let col_instance_USDC;
    beforeEach(async() => {
        instanceCERES = await CEREStable.deployed();
        instanceOracle_chainlink_ETH_USD = await ChainlinkETHUSDPriceConsumerTest.deployed();
        instance_CERES_eth_usd_pricer = await ChainlinkETHUSDPriceConsumerTest.at(await instanceCERES.eth_usd_pricer());

        wethInstance = await WETH.deployed();
        oracle_instance_CERES_WETH = await UniswapPairOracle_CERES_WETH.deployed();
        oracle_instance_CSS_WETH = await UniswapPairOracle_CSS_WETH.deployed();
        col_instance_USDC = await FakeCollateral_USDC.deployed(); 
    });

    it ('check col_instance_USDC.address(), its default value is not empty', async() => {
        // console.log(chalk.blue(`col_instance_USDC: ${col_instance_USDC.address}`));
        expect(col_instance_USDC.address).to.not.be.empty;
    });

    it ('check col_instance_USDC.symbol.call(), its default value is USDC', async() => {
        const expected_value = "USDC";
        expect(await col_instance_USDC.symbol.call()).to.equal(expected_value);
    });

    it ('check col_instance_USDC.decimals.call(), its default value is 18', async() => {
        const expected_value = 18;
        expect(parseFloat(await col_instance_USDC.decimals.call())).to.equal(expected_value);
    });

    it ('check col_instance_USDC.creator_address.call(), its default value is OWNER', async() => {
        const expected_value = OWNER;
        expect(await col_instance_USDC.creator_address.call()).to.equal(expected_value);
    });

    it ('check col_instance_USDC.genesis_supply.call(), its default value is ONE_HUNDRED_MILLION_DEC18', async() => {
        const expected_value = ONE_HUNDRED_MILLION_DEC18;
        expect(parseFloat(await col_instance_USDC.genesis_supply.call())).to.equal(parseFloat(expected_value));
    });

    // PUBLIC FUNC() TEST SCRIPTS
    it ('check col_instance_USDC.totalSupply.call(), its default value is ONE_HUNDRED_MILLION_DEC18', async() => {
        const expected_value = ONE_HUNDRED_MILLION_DEC18;
        expect(parseFloat(await col_instance_USDC.totalSupply.call())).to.equal(parseFloat(expected_value));
    });

    // TRANSFERRED TWO_THOUSAND_DEC18 USDC TO USDC-WETH ORACLE.
    it ('check col_instance_USDC.balanceOf.call(OWNER), its default value is ONE_HUNDRED_MILLION_DEC18', async() => {
        const expected_value = ONE_HUNDRED_MILLION_DEC18;
        expect(parseFloat(await col_instance_USDC.balanceOf.call(OWNER))+parseFloat(TWO_THOUSAND_DEC18)+parseFloat(COLLATERAL_SEED_DEC18)).to.equal(parseFloat(expected_value));
        expect(parseFloat(await col_instance_USDC.balanceOf.call(TEST_ACCOUNT))).to.equal(parseFloat(0));
    });
    // TRANSFERRED TWO_THOUSAND_DEC18 USDC TO USDC-WETH ORACLE.
    it ('check col_instance_USDC.transfer(TEST_ACCOUNT,ONE_MILLION_DEC18)', async() => {
        // BEFORE
        const expected_value = ONE_HUNDRED_MILLION_DEC18;
        expect(parseFloat(await col_instance_USDC.balanceOf.call(OWNER))+parseFloat(TWO_THOUSAND_DEC18)+parseFloat(COLLATERAL_SEED_DEC18)).to.equal(parseFloat(expected_value));
        expect(parseFloat(await col_instance_USDC.balanceOf.call(TEST_ACCOUNT))).to.equal(parseFloat(0));
        // ACTION & ASSERTION
        const TRANSFER_AMOUNT = ONE_MILLION_DEC18;
        await col_instance_USDC.transfer(TEST_ACCOUNT,TRANSFER_AMOUNT,{from: OWNER});
        expect(parseFloat(await col_instance_USDC.balanceOf.call(TEST_ACCOUNT))).to.equal(parseFloat(TRANSFER_AMOUNT));

        // ROLLBACK CODE
        await col_instance_USDC.transfer(OWNER,TRANSFER_AMOUNT,{from: TEST_ACCOUNT});
        expect(parseFloat(await col_instance_USDC.balanceOf.call(OWNER))+parseFloat(TWO_THOUSAND_DEC18)+parseFloat(COLLATERAL_SEED_DEC18)).to.equal(parseFloat(expected_value));
    });

    it ('check col_instance_USDC.faucet()', async() => {
        // BEFORE
        expect(parseFloat(await col_instance_USDC.balanceOf.call(TEST_ACCOUNT))).to.equal(parseFloat(0));
        // ACTION & ASSERTION
        const expected_value = ONE_THOUSAND_DEC18;
        await col_instance_USDC.faucet({from: TEST_ACCOUNT});
        expect(parseFloat(await col_instance_USDC.balanceOf.call(TEST_ACCOUNT))).to.equal(parseFloat(expected_value));
    });



    
});
