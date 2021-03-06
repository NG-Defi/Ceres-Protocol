// const ConvertLib = artifacts.require("ConvertLib");
const BigNumber = require('bignumber.js');
// const MetaCoin = artifacts.require("MetaCoin");
const ERC20 = artifacts.require("ERC20");
const BOND = artifacts.require("Bond");
// const COMP = artifacts.require("ERC20/Variants/Comp");
const CEREStable = artifacts.require("Ceres/CEREStable");
const CEREShares = artifacts.require("CSS/CEREShares");
const CeresPoolLibrary = artifacts.require("Ceres/Pools/CERESPoolLibrary");
const Pool_USDC = artifacts.require("Ceres/Pools/Pool_USDC");
const ChainlinkETHUSDPriceConsumerTest = artifacts.require("Oracle/ChainlinkETHUSDPriceConsumerTest");
const FakeCollateral_USDC = artifacts.require("FakeCollateral/FakeCollateral_USDC");

const chalk = require('chalk');

module.exports = async function(deployer,network,accounts) {
  // Set the Network Settings
	const IS_MAINNET = (network == 'mainnet');
	const IS_ROPSTEN = (network == 'ropsten');
	const IS_DEV = (network == 'development');
	const IS_GANACHE = (network == 'devganache');
  	const IS_BSC_TESTNET = (network == 'testnet');
	const IS_RINKEBY = (network == 'rinkeby');

	// set the deploy address
	const OWNER = accounts[0];
	const ADMIN = accounts[1];
	const account0 = accounts[0];
	const account1 = accounts[1];
	const account2 = accounts[2];
	const account3 = accounts[3];
	const account4 = accounts[4];
	const account5 = accounts[5];
	const account6 = accounts[6];
	const account7 = accounts[7];
	console.log(chalk.red.bold(`account0: ${account0}`));
	console.log(chalk.red.bold(`account1: ${account1}`));
	console.log(chalk.red.bold(`account2: ${account2}`));
	console.log(chalk.red.bold(`account3: ${account3}`));
	console.log(chalk.red.bold(`account4: ${account4}`));
	console.log(chalk.red.bold(`account5: ${account5}`));
	console.log(chalk.red.bold(`account6: ${account6}`));
	console.log(chalk.red.bold(`account7: ${account7}`));

	const FIVE_MILLION_DEC18 = new BigNumber("5000000e18");
	const ONE_HUNDRED_MILLION_DEC18 = new BigNumber("100000000e18");

	// deployer.deploy(ConvertLib);
	// deployer.link(ConvertLib, MetaCoin);
	// deployer.deploy(MetaCoin);

	// await deployer.deploy(ERC20,"sample","sample");
	// const sampleERC20 = await ERC20.deployed();
	// console.log(chalk.red.bold(`sampleERC20: ${await sampleERC20.address}`));
	
	await deployer.deploy(CEREStable, "CERES", "CERES", OWNER, OWNER,{from: OWNER});
	const ceresInstance = await CEREStable.deployed();
	console.log(chalk.red.bold(`ceresInstance: ${await ceresInstance.address}`));

	await deployer.deploy(CEREShares, "CERES Share", "CSS", OWNER, OWNER,OWNER,{from: OWNER});
	const cssInstance = await CEREShares.deployed();
	console.log(chalk.red.bold(`cssInstance: ${await cssInstance.address}`));

	await deployer.deploy(BOND,{from: OWNER});
	const bondInstance = await BOND.deployed();
	console.log(chalk.red.bold(`bondInstance: ${await bondInstance.address}`));

	await deployer.deploy(CeresPoolLibrary);
    await deployer.link(CeresPoolLibrary, [Pool_USDC]);



	await deployer.deploy(ChainlinkETHUSDPriceConsumerTest);
	const oracle_chainlink_ETH_USD = await ChainlinkETHUSDPriceConsumerTest.deployed();
	console.log(chalk.red.bold(`oracle_chainlink_ETH_USD: ${oracle_chainlink_ETH_USD.address}`));
	await ceresInstance.setETHUSDOracle(oracle_chainlink_ETH_USD.address, { from: OWNER });

	// TEST CASE DONE
	await deployer.deploy(FakeCollateral_USDC, OWNER, ONE_HUNDRED_MILLION_DEC18, "USDC", 18);
	const col_instance_USDC = await FakeCollateral_USDC.deployed(); 
	console.log(chalk.red.bold(`col_instance_USDC: ${col_instance_USDC.address}`));

	await deployer.deploy(Pool_USDC, ceresInstance.address, cssInstance.address, col_instance_USDC.address, OWNER, OWNER, FIVE_MILLION_DEC18);
	const pool_instance_USDC = await Pool_USDC.deployed();
	console.log(chalk.red.bold(`pool_instance_USDC: ${await pool_instance_USDC.address}`));

	// DEPLOY COMP
	// await deployer.deploy(COMP,OWNER,{from: OWNER});
	// const compInstance = await COMP.deployed();
	// console.log(chalk.red.bold(`compInstance: ${await compInstance.address}`));
	
	
};
