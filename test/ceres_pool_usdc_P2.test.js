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
const ERC20 = artifacts.require("ERC20");
const ONE_DEC18 = new BigNumber("1e18");
const ONE_MILLION_DEC18 = new BigNumber("1000000e18");
const ONE_HUNDRED_MILLION_DEC18 = new BigNumber("100000000e18");
const FIVE_MILLION_DEC18 = new BigNumber("5000000e18");
const BIG6 = new BigNumber("1e6");

contract('contracts/Ceres/Pools/CeresPool.sol', async (accounts) => {
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

    let instanceCSS;
    let instanceCERES;
    let instance_Pool_USDC;
    let instance_Pool_USDC_collateral_token;
    let col_instance_USDC;
    beforeEach(async() => {
        instanceSampleERC20 = await ERC20.deployed();
        instanceCSS = await CEREShares.deployed();
        instanceCERES = await CEREStable.deployed();
        instance_Pool_USDC = await Pool_USDC.deployed();

        instance_Pool_USDC_collateral_token = await ERC20.at(await instance_Pool_USDC.collateral_token());
        instance_Pool_USDC_CERES = await CEREStable.at(await instance_Pool_USDC.CERES());
        instance_Pool_USDC_CSS = await CEREShares.at(await instance_Pool_USDC.CSS());
        col_instance_USDC = await FakeCollateral_USDC.deployed(); 
    });

    it('check instance_Pool_USDC.mint1t1CERES()', async() => {

        console.log(await instance_Pool_USDC.collateral_token());
        // ACTION
		const collateral_amount = ONE_DEC18;
        const collateral_price = parseFloat(new BigNumber(await instance_Pool_USDC.getCollateralPrice.call()).div(BIG6));
		const ceres_out_min = new BigNumber(collateral_amount.times(collateral_price).times(0.99)); // 1% slippage
		await instance_Pool_USDC.mint1t1CERES(collateral_amount, ceres_out_min, { from: OWNER });
    })

});
