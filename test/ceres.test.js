const chalk = require('chalk');
const { assert, expect } = require('chai');

const CEREStable = artifacts.require("Ceres/CEREStable");

contract('CERES.sol', async (accounts) => {

    // set the deploy address
	const OWNER = accounts[0];
	const ADMIN = accounts[1];
	const account0 = accounts[0];
	const account1 = accounts[1];
	const account2 = accounts[2];
	const account3 = accounts[3];
    let instanceCERES;
    beforeEach(async() => {
        instanceCERES = await CEREStable.deployed();
    });

    it('check CERES name = "CERES" ', async () => {
        const NAME_VALUE = 'CERES';
        expect(await instanceCERES.name()).to.equal(NAME_VALUE);
    });

    it('check CERES symbol = "CERES" ', async () => {
        const SYMBOL_VALUE = 'CERES';
        expect(await instanceCERES.symbol()).to.equal(SYMBOL_VALUE);
    });

    it('check CERES creator_address = OWNER ', async () => {
        expect(await instanceCERES.creator_address()).to.equal(OWNER);
    });

    it('check CERES timelock_address = OWNER ', async () => {
        expect(await instanceCERES.timelock_address()).to.equal(OWNER);
    });

    it('check CERES DEFAULT_ADMIN_ADDRESS = OWNER ', async () => {
        expect(await instanceCERES.DEFAULT_ADMIN_ADDRESS()).to.equal(OWNER);
    });

    it('check CERES owner_address = OWNER ', async () => {
        expect(await instanceCERES.owner_address()).to.equal(OWNER);
    });
});
