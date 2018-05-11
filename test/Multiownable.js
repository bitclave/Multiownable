// @flow
import EVMRevert from './helpers/EVMRevert';

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(web3.BigNumber))
    .should();

const ItemsSetAndLookup = artifacts.require('ItemsSetAndLookup.sol');
const Multiownable = artifacts.require('Multiownable.sol');
const MultiownableImpl = artifacts.require('./impl/MultiownableImpl.sol');

contract('Multiownable', function ([_, wallet1, wallet2, wallet3, wallet4, wallet5]) {
    before(async function () {
        Multiownable.link('ItemsSetAndLookup', (await ItemsSetAndLookup.new()).address);
        MultiownableImpl.link('ItemsSetAndLookup', (await ItemsSetAndLookup.new()).address);
    });

    it('should be initialized', async function () {
        const obj = await Multiownable.new();

        (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(1);
        (await obj.ownersLength.call()).should.be.bignumber.equal(1);
        (await obj.ownerAt.call(0)).should.be.equal(_);
        (await obj.isOwner.call(_)).should.be.true;
        (await obj.isOwner.call(wallet1)).should.be.false;
        (await obj.isOwner.call(wallet2)).should.be.false;
        (await obj.isOwner.call(wallet3)).should.be.false;
        (await obj.allOwners.call()).should.be.deep.equal([
            '0x000000000000000000000000' + _.substr(2),
        ]);
    });

    describe('addOwners', async function () {
        it('should add 1 mandatory owner', async function () {
            const obj = await Multiownable.new();

            await obj.addOwners([wallet1]);

            (await obj.ownerAt.call(0)).should.be.equal(_);
            (await obj.ownerAt.call(1)).should.be.equal(wallet1);
            (await obj.ownersLength.call()).should.be.bignumber.equal(2);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(2);

            (await obj.isOwner.call(_)).should.be.true;
            (await obj.isOwner.call(wallet1)).should.be.true;
            (await obj.isOwner.call(wallet2)).should.be.false;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });

        it('should increase howMany respectively 2 => 4 for 2 => 4 owners', async function () {
            const obj = await Multiownable.new();

            await obj.addOwnersWithHowMany([wallet1], 2);

            (await obj.ownersLength.call()).should.be.bignumber.equal(2);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(2);

            await obj.addOwners([wallet2, wallet3], { from: _ });
            await obj.addOwners([wallet2, wallet3], { from: wallet1 });

            (await obj.ownersLength.call()).should.be.bignumber.equal(4);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(4);
        });

        it('should increase howMany respectively 1 => 3 for 2 => 4 owners', async function () {
            const obj = await Multiownable.new();

            await obj.addOwnersWithHowMany([wallet1], 1);

            (await obj.ownersLength.call()).should.be.bignumber.equal(2);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(1);

            await obj.addOwners([wallet2, wallet3], { from: _ });
            await obj.addOwners([wallet2, wallet3], { from: wallet1 });

            (await obj.ownersLength.call()).should.be.bignumber.equal(4);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(3);
        });
    });

    describe('addOwnersWithHowMany', async function () {
        it('should fail with too low howMany arg', async function () {
            const obj = await Multiownable.new();
            await obj.addOwnersWithHowMany([wallet1], 0).should.be.rejectedWith(EVMRevert);
        });

        it('should fail with too high howMany arg', async function () {
            const obj = await Multiownable.new();
            await obj.addOwnersWithHowMany([wallet1], 3).should.be.rejectedWith(EVMRevert);
        });

        it('should add 1 optional owner', async function () {
            const obj = await Multiownable.new();

            await obj.addOwnersWithHowMany([wallet1], 1);

            (await obj.ownerAt.call(0)).should.be.equal(_);
            (await obj.ownerAt.call(1)).should.be.equal(wallet1);
            (await obj.ownersLength.call()).should.be.bignumber.equal(2);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(1);

            (await obj.isOwner.call(_)).should.be.true;
            (await obj.isOwner.call(wallet1)).should.be.true;
            (await obj.isOwner.call(wallet2)).should.be.false;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });

        it('should add 2 mandatory owners', async function () {
            const obj = await Multiownable.new();

            await obj.addOwners([wallet1, wallet2]);

            (await obj.ownerAt.call(0)).should.be.equal(_);
            (await obj.ownerAt.call(1)).should.be.equal(wallet1);
            (await obj.ownerAt.call(2)).should.be.equal(wallet2);
            (await obj.ownersLength.call()).should.be.bignumber.equal(3);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(3);

            (await obj.isOwner.call(_)).should.be.true;
            (await obj.isOwner.call(wallet1)).should.be.true;
            (await obj.isOwner.call(wallet2)).should.be.true;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });

        it('should add 2 owners with 1 mandatory', async function () {
            const obj = await Multiownable.new();

            await obj.addOwnersWithHowMany([wallet1, wallet2], 2);

            (await obj.ownerAt.call(0)).should.be.equal(_);
            (await obj.ownerAt.call(1)).should.be.equal(wallet1);
            (await obj.ownerAt.call(2)).should.be.equal(wallet2);
            (await obj.ownersLength.call()).should.be.bignumber.equal(3);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(2);

            (await obj.isOwner.call(_)).should.be.true;
            (await obj.isOwner.call(wallet1)).should.be.true;
            (await obj.isOwner.call(wallet2)).should.be.true;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });

        it('should add 2 optional owners', async function () {
            const obj = await Multiownable.new();

            await obj.addOwnersWithHowMany([wallet1, wallet2], 1);

            (await obj.ownerAt.call(0)).should.be.equal(_);
            (await obj.ownerAt.call(1)).should.be.equal(wallet1);
            (await obj.ownerAt.call(2)).should.be.equal(wallet2);
            (await obj.ownersLength.call()).should.be.bignumber.equal(3);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(1);

            (await obj.isOwner.call(_)).should.be.true;
            (await obj.isOwner.call(wallet1)).should.be.true;
            (await obj.isOwner.call(wallet2)).should.be.true;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });

        it('should add 1 owners by 2 owners', async function () {
            const obj = await Multiownable.new();

            await obj.addOwners([wallet1]);
            await obj.addOwners([wallet2], { from: _ });
            await obj.addOwners([wallet2], { from: wallet1 });

            (await obj.ownerAt.call(0)).should.be.equal(_);
            (await obj.ownerAt.call(1)).should.be.equal(wallet1);
            (await obj.ownerAt.call(2)).should.be.equal(wallet2);
            (await obj.ownersLength.call()).should.be.bignumber.equal(3);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(3);

            (await obj.isOwner.call(_)).should.be.true;
            (await obj.isOwner.call(wallet1)).should.be.true;
            (await obj.isOwner.call(wallet2)).should.be.true;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });

        it('should add 2 owners by 2 owners', async function () {
            const obj = await Multiownable.new();

            await obj.addOwners([wallet1]);
            await obj.addOwners([wallet2, wallet3], { from: wallet1 });
            await obj.addOwners([wallet2, wallet3], { from: _ });

            (await obj.ownerAt.call(0)).should.be.equal(_);
            (await obj.ownerAt.call(1)).should.be.equal(wallet1);
            (await obj.ownerAt.call(2)).should.be.equal(wallet2);
            (await obj.ownerAt.call(3)).should.be.equal(wallet3);
            (await obj.ownersLength.call()).should.be.bignumber.equal(4);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(4);

            (await obj.isOwner.call(_)).should.be.true;
            (await obj.isOwner.call(wallet1)).should.be.true;
            (await obj.isOwner.call(wallet2)).should.be.true;
            (await obj.isOwner.call(wallet3)).should.be.true;
        });
    });

    describe('removeOwners', async function () {
        it('should remove first of 2 owners', async function () {
            const obj = await Multiownable.new();

            await obj.addOwners([wallet1]);
            await obj.removeOwnersWithHowMany([_], 1, { from: _ });
            await obj.removeOwnersWithHowMany([_], 1, { from: wallet1 });

            (await obj.ownerAt.call(0)).should.be.equal(wallet1);
            (await obj.ownersLength.call()).should.be.bignumber.equal(1);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(1);

            (await obj.isOwner.call(_)).should.be.false;
            (await obj.isOwner.call(wallet1)).should.be.true;
            (await obj.isOwner.call(wallet2)).should.be.false;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });

        it('should remove last of 2 owners', async function () {
            const obj = await Multiownable.new();

            await obj.addOwners([wallet1]);
            await obj.removeOwnersWithHowMany([wallet1], 1, { from: _ });
            await obj.removeOwnersWithHowMany([wallet1], 1, { from: wallet1 });

            (await obj.ownerAt.call(0)).should.be.equal(_);
            (await obj.ownersLength.call()).should.be.bignumber.equal(1);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(1);

            (await obj.isOwner.call(_)).should.be.true;
            (await obj.isOwner.call(wallet1)).should.be.false;
            (await obj.isOwner.call(wallet2)).should.be.false;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });

        it('should remove mid of 3 owners', async function () {
            const obj = await Multiownable.new();

            await obj.addOwners([wallet1, wallet2]);
            await obj.removeOwnersWithHowMany([wallet1], 2, { from: _ });
            await obj.removeOwnersWithHowMany([wallet1], 2, { from: wallet1 });
            await obj.removeOwnersWithHowMany([wallet1], 2, { from: wallet2 });

            (await obj.ownerAt.call(0)).should.be.equal(_);
            (await obj.ownerAt.call(1)).should.be.equal(wallet2);
            (await obj.ownersLength.call()).should.be.bignumber.equal(2);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(2);

            (await obj.isOwner.call(_)).should.be.true;
            (await obj.isOwner.call(wallet1)).should.be.false;
            (await obj.isOwner.call(wallet2)).should.be.true;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });

        it('should remove one of 2 owners with howMany=1', async function () {
            const obj = await Multiownable.new();

            await obj.addOwnersWithHowMany([wallet1], 1);
            await obj.removeOwners([wallet1], { from: _ }); // howMany=1

            (await obj.ownerAt.call(0)).should.be.equal(_);
            (await obj.ownersLength.call()).should.be.bignumber.equal(1);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(1); // !

            (await obj.isOwner.call(_)).should.be.true;
            (await obj.isOwner.call(wallet1)).should.be.false;
            (await obj.isOwner.call(wallet2)).should.be.false;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });
    });

    describe('resignOwnership', async function () {
        it('should remove first of 2 owners', async function () {
            const obj = await Multiownable.new();

            await obj.addOwners([wallet1]);
            await obj.resignOwnership({ from: _ });

            (await obj.ownerAt.call(0)).should.be.equal(wallet1);
            (await obj.ownersLength.call()).should.be.bignumber.equal(1);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(1);

            (await obj.isOwner.call(_)).should.be.false;
            (await obj.isOwner.call(wallet1)).should.be.true;
            (await obj.isOwner.call(wallet2)).should.be.false;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });

        it('should remove last of 2 owners', async function () {
            const obj = await Multiownable.new();

            await obj.addOwners([wallet1]);
            await obj.resignOwnership({ from: wallet1 });

            (await obj.ownerAt.call(0)).should.be.equal(_);
            (await obj.ownersLength.call()).should.be.bignumber.equal(1);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(1);

            (await obj.isOwner.call(_)).should.be.true;
            (await obj.isOwner.call(wallet1)).should.be.false;
            (await obj.isOwner.call(wallet2)).should.be.false;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });

        it('should remove mid of 3 owners', async function () {
            const obj = await Multiownable.new();

            await obj.addOwners([wallet1, wallet2]);
            await obj.resignOwnership({ from: wallet1 });

            (await obj.ownerAt.call(0)).should.be.equal(_);
            (await obj.ownerAt.call(1)).should.be.equal(wallet2);
            (await obj.ownersLength.call()).should.be.bignumber.equal(2);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(2);

            (await obj.isOwner.call(_)).should.be.true;
            (await obj.isOwner.call(wallet1)).should.be.false;
            (await obj.isOwner.call(wallet2)).should.be.true;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });

        it('should remove one of 2 owners with howMany=1', async function () {
            const obj = await Multiownable.new();

            await obj.addOwnersWithHowMany([wallet1], 1);
            await obj.resignOwnership({ from: wallet1 });

            (await obj.ownerAt.call(0)).should.be.equal(_);
            (await obj.ownersLength.call()).should.be.bignumber.equal(1);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(1); // !

            (await obj.isOwner.call(_)).should.be.true;
            (await obj.isOwner.call(wallet1)).should.be.false;
            (await obj.isOwner.call(wallet2)).should.be.false;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });

        it('should remove one of 3 owners with howMany=2', async function () {
            const obj = await Multiownable.new();

            await obj.addOwnersWithHowMany([wallet1, wallet2], 2);
            await obj.resignOwnership({ from: wallet1 });

            (await obj.ownerAt.call(0)).should.be.equal(_);
            (await obj.ownerAt.call(1)).should.be.equal(wallet2);
            (await obj.ownersLength.call()).should.be.bignumber.equal(2);
            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(1); // !

            (await obj.isOwner.call(_)).should.be.true;
            (await obj.isOwner.call(wallet1)).should.be.false;
            (await obj.isOwner.call(wallet2)).should.be.true;
            (await obj.isOwner.call(wallet3)).should.be.false;
        });

        it('should fail to remove last owner', async function () {
            const obj = await Multiownable.new();
            await obj.resignOwnership({ from: _ }).should.be.rejectedWith(EVMRevert);
        });
    });

    describe('transferOwnershipWithHowMany', async function () {
        it('should transfer from 1 to 1', async function () {
            const obj = await Multiownable.new();

            await obj.transferOwnershipWithHowMany([wallet1], 1);

            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(1);
            (await obj.ownersLength.call()).should.be.bignumber.equal(1);
            (await obj.ownerAt.call(0)).should.be.equal(wallet1);
        });

        it('should transfer from 1 to 2', async function () {
            const obj = await Multiownable.new();

            await obj.transferOwnershipWithHowMany([wallet1, wallet2], 2);

            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(2);
            (await obj.ownersLength.call()).should.be.bignumber.equal(2);
            (await obj.ownerAt.call(0)).should.be.equal(wallet1);
            (await obj.ownerAt.call(1)).should.be.equal(wallet2);
        });

        it('should transfer from 2 to 1', async function () {
            const obj = await Multiownable.new();

            await obj.transferOwnershipWithHowMany([wallet1, wallet2], 2);
            await obj.transferOwnershipWithHowMany([wallet3], 1, { from: wallet1 });
            await obj.transferOwnershipWithHowMany([wallet3], 1, { from: wallet2 });

            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(1);
            (await obj.ownersLength.call()).should.be.bignumber.equal(1);
            (await obj.ownerAt.call(0)).should.be.equal(wallet3);
        });

        it('should transfer from 2 to 2', async function () {
            const obj = await Multiownable.new();

            await obj.transferOwnershipWithHowMany([wallet1, wallet2], 2);
            await obj.transferOwnershipWithHowMany([wallet3, wallet4], 2, { from: wallet1 });
            await obj.transferOwnershipWithHowMany([wallet3, wallet4], 2, { from: wallet2 });

            (await obj.howManyOwnersDecide.call()).should.be.bignumber.equal(2);
            (await obj.ownersLength.call()).should.be.bignumber.equal(2);
            (await obj.ownerAt.call(0)).should.be.equal(wallet3);
            (await obj.ownerAt.call(1)).should.be.equal(wallet4);
        });
    });

    describe('owners', async function () {
        it('should manage operations array correctly for 3 owners after 1 owner', async function () {
            const obj = await Multiownable.new();

            await obj.transferOwnershipWithHowMany([wallet1, wallet2, wallet3], 3);

            (await obj.ownersLength.call()).should.be.bignumber.equal(3);
            (await obj.ownerAt.call(0)).should.be.equal(wallet1);
            (await obj.ownerAt.call(1)).should.be.equal(wallet2);
            (await obj.ownerAt.call(2)).should.be.equal(wallet3);
            (await obj.isOwner.call(_)).should.be.false;
            (await obj.isOwner.call(wallet1)).should.be.true;
            (await obj.isOwner.call(wallet2)).should.be.true;
            (await obj.isOwner.call(wallet3)).should.be.true;
            (await obj.allOwners.call()).should.be.deep.equal([
                '0x000000000000000000000000' + wallet1.substr(2),
                '0x000000000000000000000000' + wallet2.substr(2),
                '0x000000000000000000000000' + wallet3.substr(2),
            ]);
        });

        it('should manage operations array correctly for 2 owners after 3 owners', async function () {
            const obj = await Multiownable.new();

            await obj.transferOwnershipWithHowMany([wallet1, wallet2, wallet3], 3);
            await obj.transferOwnershipWithHowMany([wallet3, wallet2], 2, { from: wallet1 });
            await obj.transferOwnershipWithHowMany([wallet3, wallet2], 2, { from: wallet2 });
            await obj.transferOwnershipWithHowMany([wallet3, wallet2], 2, { from: wallet3 });

            (await obj.ownersLength.call()).should.be.bignumber.equal(2);
            (await obj.ownerAt.call(0)).should.be.equal(wallet3);
            (await obj.ownerAt.call(1)).should.be.equal(wallet2);
            (await obj.isOwner.call(_)).should.be.false;
            (await obj.isOwner.call(wallet1)).should.be.false;
            (await obj.isOwner.call(wallet2)).should.be.true;
            (await obj.isOwner.call(wallet3)).should.be.true;
            (await obj.allOwners.call()).should.be.deep.equal([
                '0x000000000000000000000000' + wallet3.substr(2),
                '0x000000000000000000000000' + wallet2.substr(2),
            ]);
        });
    });

    describe('operations', async function () {
        it('should manage operations array correctly', async function () {
            const obj = await Multiownable.new();

            // Transfer ownership 1 => 1
            (await obj.operationsLength.call()).should.be.bignumber.equal(0);
            await obj.transferOwnershipWithHowMany([wallet1], 1);
            (await obj.operationsLength.call()).should.be.bignumber.equal(0);

            // Transfer ownership 1 => 2
            (await obj.operationsLength.call()).should.be.bignumber.equal(0);
            await obj.transferOwnershipWithHowMany([wallet2, wallet3], 2, { from: wallet1 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(0);

            // Transfer ownership 2 => 2
            (await obj.operationsLength.call()).should.be.bignumber.equal(0);
            await obj.transferOwnershipWithHowMany([wallet4, wallet5], 2, { from: wallet2 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(1);
            (await obj.allOperations.call()).should.be.deep.equal([
                await obj.operationAt.call(0),
            ]);
            await obj.transferOwnershipWithHowMany([wallet4, wallet5], 2, { from: wallet3 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(0);
        });

        it('should allow to cancel pending operations', async function () {
            const obj = await Multiownable.new();
            await obj.transferOwnershipWithHowMany([wallet1, wallet2, wallet3], 3);

            // First owner agree
            await obj.transferOwnershipWithHowMany([wallet4], 1, { from: wallet1 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(1);
            (await obj.allOperations.call()).should.be.deep.equal([
                await obj.operationAt.call(0),
            ]);

            // First owner disagree
            const operation1 = await obj.operationAt.call(0);
            await obj.cancelOperation(operation1, { from: wallet1 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(0);

            // First and Second owners agree
            await obj.transferOwnershipWithHowMany([wallet4], 1, { from: wallet1 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(1);
            (await obj.allOperations.call()).should.be.deep.equal([
                await obj.operationAt.call(0),
            ]);
            await obj.transferOwnershipWithHowMany([wallet4], 1, { from: wallet2 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(1);
            (await obj.allOperations.call()).should.be.deep.equal([
                await obj.operationAt.call(0),
            ]);

            // Second owner disagree
            const operation2 = await obj.operationAt.call(0);
            await obj.cancelOperation(operation2, { from: wallet2 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(1);
            (await obj.allOperations.call()).should.be.deep.equal([
                await obj.operationAt.call(0),
            ]);

            // Third owner agree
            await obj.transferOwnershipWithHowMany([wallet4], 1, { from: wallet3 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(1);
            (await obj.allOperations.call()).should.be.deep.equal([
                await obj.operationAt.call(0),
            ]);

            // Second owner agree
            await obj.transferOwnershipWithHowMany([wallet4], 1, { from: wallet2 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(0);
        });

        it('should reset all pending operations when owners change', async function () {
            const obj = await MultiownableImpl.new();
            await obj.transferOwnershipWithHowMany([wallet1, wallet2], 2);

            await obj.setValue(1, { from: wallet1 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(1);
            (await obj.allOperations.call()).should.be.deep.equal([
                await obj.operationAt.call(0),
            ]);

            await obj.transferOwnershipWithHowMany([wallet3], 1, { from: wallet1 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(2);
            (await obj.allOperations.call()).should.be.deep.equal([
                await obj.operationAt.call(0),
                await obj.operationAt.call(1),
            ]);

            await obj.transferOwnershipWithHowMany([wallet3], 1, { from: wallet2 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(0);
        });

        it('should correctly perform last operation', async function () {
            const obj = await MultiownableImpl.new();
            await obj.transferOwnershipWithHowMany([wallet1, wallet2], 2);

            await obj.setValue(1, { from: wallet1 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(1);
            (await obj.allOperations.call()).should.be.deep.equal([
                await obj.operationAt.call(0),
            ]);

            await obj.transferOwnershipWithHowMany([wallet3], 1, { from: wallet1 });
            (await obj.operationsLength.call()).should.be.bignumber.equal(2);
            (await obj.allOperations.call()).should.be.deep.equal([
                await obj.operationAt.call(0),
                await obj.operationAt.call(1),
            ]);

            await obj.transferOwnershipWithHowMany([wallet3], 1, { from: wallet2 });
            (await obj.ownerAt.call(0)).should.be.equal(wallet3);
        });
    });

    it('should correctly perform not last operation', async function () {
        const obj = await MultiownableImpl.new();
        await obj.transferOwnershipWithHowMany([wallet1, wallet2], 2);

        await obj.setValue(1, { from: wallet1 });
        (await obj.operationsLength.call()).should.be.bignumber.equal(1);
        (await obj.allOperations.call()).should.be.deep.equal([
            await obj.operationAt.call(0),
        ]);

        await obj.transferOwnershipWithHowMany([wallet3], 1, { from: wallet1 });
        (await obj.operationsLength.call()).should.be.bignumber.equal(2);
        (await obj.allOperations.call()).should.be.deep.equal([
            await obj.operationAt.call(0),
            await obj.operationAt.call(1),
        ]);

        await obj.setValue(1, { from: wallet2 });
        (await obj.value.call()).should.be.bignumber.equal(1);
    });

    it('should handle multiple simultaneous operations correctly', async function () {
        const obj = await MultiownableImpl.new();
        await obj.transferOwnershipWithHowMany([wallet1, wallet2], 2);

        // wallet1 => 1
        await obj.setValue(1, { from: wallet1 });
        (await obj.operationsLength.call()).should.be.bignumber.equal(1);
        (await obj.allOperations.call()).should.be.deep.equal([
            await obj.operationAt.call(0),
        ]);

        // Check value
        (await obj.value.call()).should.be.bignumber.equal(0);

        // wallet2 => 2
        await obj.setValue(2, { from: wallet2 });
        (await obj.operationsLength.call()).should.be.bignumber.equal(2);
        (await obj.allOperations.call()).should.be.deep.equal([
            await obj.operationAt.call(0),
            await obj.operationAt.call(1),
        ]);

        // Check value
        (await obj.value.call()).should.be.bignumber.equal(0);

        // wallet1 => 2
        await obj.setValue(2, { from: wallet1 });
        (await obj.operationsLength.call()).should.be.bignumber.equal(1);
        (await obj.allOperations.call()).should.be.deep.equal([
            await obj.operationAt.call(0),
        ]);

        // Check value
        (await obj.value.call()).should.be.bignumber.equal(2);

        // wallet2 => 1
        await obj.setValue(1, { from: wallet2 });
        (await obj.operationsLength.call()).should.be.bignumber.equal(0);

        // Check value
        (await obj.value.call()).should.be.bignumber.equal(1);
    });

    it('should allow to call onlyAnyOwner methods properly', async function () {
        const obj = await MultiownableImpl.new();
        await obj.transferOwnershipWithHowMany([wallet1, wallet2], 2);

        // Not owners try to call
        await obj.setValueAny(1, { from: _ }).should.be.rejectedWith(EVMRevert);
        await obj.setValueAny(1, { from: wallet3 }).should.be.rejectedWith(EVMRevert);

        // Owners try to call
        await obj.setValueAny(2, { from: wallet1 }).should.be.fulfilled;
        (await obj.value.call()).should.be.bignumber.equal(2);
        await obj.setValueAny(3, { from: wallet2 }).should.be.fulfilled;
        (await obj.value.call()).should.be.bignumber.equal(3);
    });

    it('should allow to call onlyManyOwners methods properly', async function () {
        const obj = await MultiownableImpl.new();
        await obj.transferOwnershipWithHowMany([wallet1, wallet2], 2);

        // Not owners try to call
        await obj.setValue(1, { from: _ }).should.be.rejectedWith(EVMRevert);
        await obj.setValue(1, { from: wallet3 }).should.be.rejectedWith(EVMRevert);

        // Single owners try to call twice
        await obj.setValue(2, { from: wallet1 }).should.be.fulfilled;
        await obj.setValue(2, { from: wallet1 }).should.be.rejectedWith(EVMRevert);
    });

    it('should allow to call onlyAllOwners methods properly', async function () {
        const obj = await MultiownableImpl.new();
        await obj.transferOwnershipWithHowMany([wallet1, wallet2], 1);

        // Not owners try to call
        await obj.setValueAll(1, { from: _ }).should.be.rejectedWith(EVMRevert);
        await obj.setValueAll(1, { from: wallet3 }).should.be.rejectedWith(EVMRevert);

        // Single owners try to call twice
        await obj.setValueAll(2, { from: wallet1 }).should.be.fulfilled;
        await obj.setValueAll(2, { from: wallet2 }).should.be.fulfilled;
        (await obj.value.call()).should.be.bignumber.equal(2);
    });

    it('should allow to call onlySomeOwners(n) methods properly', async function () {
        const obj = await MultiownableImpl.new();
        await obj.transferOwnershipWithHowMany([wallet1, wallet2], 2);

        // Invalid arg
        await obj.setValueSome(1, 0, { from: _ }).should.be.rejectedWith(EVMRevert);
        await obj.setValueSome(1, 3, { from: _ }).should.be.rejectedWith(EVMRevert);

        // Not owners try to call
        await obj.setValueSome(1, 1, { from: _ }).should.be.rejectedWith(EVMRevert);
        await obj.setValueSome(1, 1, { from: wallet3 }).should.be.rejectedWith(EVMRevert);

        // Owners try to call
        await obj.setValueSome(5, 2, { from: wallet1 }).should.be.fulfilled;
        (await obj.value.call()).should.be.bignumber.equal(0);
        await obj.setValueSome(5, 2, { from: wallet2 }).should.be.fulfilled;
        (await obj.value.call()).should.be.bignumber.equal(5);
    });

    it('should not allow to cancel pending of another owner', async function () {
        const obj = await MultiownableImpl.new();
        await obj.transferOwnershipWithHowMany([wallet1, wallet2], 2);

        // First owner
        await obj.setValue(2, { from: wallet1 }).should.be.fulfilled;

        // Second owner
        const operation = await obj.operationAt.call(0);
        await obj.cancelOperation(operation, { from: wallet2 }).should.be.rejectedWith(EVMRevert);
    });

    it('should not allow to transfer ownership to no one and to user 0', async function () {
        const obj = await Multiownable.new();
        await obj.transferOwnershipWithHowMany([], 0).should.be.rejectedWith(EVMRevert);
        await obj.transferOwnershipWithHowMany([0], 1).should.be.rejectedWith(EVMRevert);
        await obj.transferOwnershipWithHowMany([0, wallet1], 2).should.be.rejectedWith(EVMRevert);
        await obj.transferOwnershipWithHowMany([wallet1, 0], 2).should.be.rejectedWith(EVMRevert);
        await obj.transferOwnershipWithHowMany([0, wallet1, wallet2], 3).should.be.rejectedWith(EVMRevert);
        await obj.transferOwnershipWithHowMany([wallet1, 0, wallet2], 3).should.be.rejectedWith(EVMRevert);
        await obj.transferOwnershipWithHowMany([wallet1, wallet2, 0], 3).should.be.rejectedWith(EVMRevert);
    });

    it('should works for nested methods with onlyManyOwners modifier', async function () {
        const obj = await MultiownableImpl.new();
        await obj.transferOwnershipWithHowMany([wallet1, wallet2], 2);

        await obj.nestedFirst(100, { from: wallet1 });
        await obj.nestedFirst(100, { from: wallet2 });

        (await obj.value.call()).should.be.bignumber.equal(100);
    });

    it('should works for nested methods with onlyAnyOwners modifier', async function () {
        const obj = await MultiownableImpl.new();
        await obj.transferOwnershipWithHowMany([wallet1, wallet2], 2);

        await obj.nestedFirstAnyToAny(100, { from: wallet3 }).should.be.rejectedWith(EVMRevert);
        await obj.nestedFirstAnyToAny2(100, { from: wallet1 }).should.be.rejectedWith(EVMRevert);

        await obj.nestedFirstAnyToAny(100, { from: wallet1 });
        await obj.nestedFirstAnyToAny(100, { from: wallet2 });
        (await obj.value.call()).should.be.bignumber.equal(100);
    });

    it('should works for nested methods with onlyAllOwners modifier', async function () {
        const obj = await MultiownableImpl.new();
        await obj.transferOwnershipWithHowMany([wallet1, wallet2], 2);

        await obj.nestedFirstAllToAll(100, { from: wallet3 }).should.be.rejectedWith(EVMRevert);
        await obj.nestedFirstAllToAll2(100, { from: wallet1 }).should.be.fulfilled;
        await obj.nestedFirstAllToAll2(100, { from: wallet2 }).should.be.rejectedWith(EVMRevert);

        await obj.nestedFirstAllToAll(100, { from: wallet1 });
        await obj.nestedFirstAllToAll(100, { from: wallet2 });
        (await obj.value.call()).should.be.bignumber.equal(100);
    });

    it('should works for nested methods with onlyManyOwners => onlySomeOwners modifier', async function () {
        const obj = await MultiownableImpl.new();
        await obj.transferOwnershipWithHowMany([wallet1, wallet2, wallet3], 3);

        await obj.nestedFirstManyToSome(100, 1, { from: wallet1 });
        await obj.nestedFirstManyToSome(100, 1, { from: wallet2 });
        await obj.nestedFirstManyToSome(100, 1, { from: wallet3 });
        (await obj.value.call()).should.be.bignumber.equal(100);

        await obj.nestedFirstManyToSome(200, 2, { from: wallet1 });
        await obj.nestedFirstManyToSome(200, 2, { from: wallet2 });
        await obj.nestedFirstManyToSome(200, 2, { from: wallet3 });
        (await obj.value.call()).should.be.bignumber.equal(200);

        await obj.nestedFirstManyToSome(300, 3, { from: wallet1 });
        await obj.nestedFirstManyToSome(300, 3, { from: wallet2 });
        await obj.nestedFirstManyToSome(300, 3, { from: wallet3 });
        (await obj.value.call()).should.be.bignumber.equal(300);
    });

    it('should works for nested methods with onlyAnyOwners => onlySomeOwners modifier', async function () {
        const obj = await MultiownableImpl.new();
        await obj.transferOwnershipWithHowMany([wallet1, wallet2, wallet3], 3);

        // 1 => 1
        await obj.nestedFirstAnyToSome(100, 1, { from: wallet1 });
        (await obj.value.call()).should.be.bignumber.equal(100);
        await obj.nestedFirstAnyToSome(200, 1, { from: wallet2 });
        (await obj.value.call()).should.be.bignumber.equal(200);
        await obj.nestedFirstAnyToSome(300, 1, { from: wallet3 });
        (await obj.value.call()).should.be.bignumber.equal(300);

        // 1 => 2
        await obj.nestedFirstAnyToSome(100, 2, { from: wallet1 }).should.be.rejectedWith(EVMRevert);
        await obj.nestedFirstAnyToSome(200, 2, { from: wallet2 }).should.be.rejectedWith(EVMRevert);
        await obj.nestedFirstAnyToSome(300, 2, { from: wallet3 }).should.be.rejectedWith(EVMRevert);
    });

    it('should not allow to transfer ownership to several equal users', async function () {
        const obj = await Multiownable.new();
        await obj.transferOwnershipWithHowMany([wallet1, wallet1], 2).should.be.rejectedWith(EVMRevert);
        await obj.transferOwnershipWithHowMany([wallet1, wallet2, wallet1], 3).should.be.rejectedWith(EVMRevert);
    });

    it('should allow to transfer ownership to the exactly 64 owners', async function () {
        const obj = await Multiownable.new();
        await obj.transferOwnershipWithHowMany([
            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10,
            0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20,
            0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D, 0x2E, 0x2F, 0x30,
            0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D, 0x3E, 0x3F, 0x40,
        ], 1).should.be.fulfilled;
    });

    it('should handle owners adding errors', async function () {
        const obj = await Multiownable.new();

        await obj.addOwnersWithHowMany([wallet1], 0).should.be.rejectedWith(EVMRevert);
        await obj.addOwnersWithHowMany([wallet1], 3).should.be.rejectedWith(EVMRevert);
        await obj.addOwnersWithHowMany([wallet1, wallet2], 4).should.be.rejectedWith(EVMRevert);
        await obj.addOwnersWithHowMany([wallet1, '0x0'], 1).should.be.rejectedWith(EVMRevert);
        await obj.addOwnersWithHowMany([wallet1, wallet1], 1).should.be.rejectedWith(EVMRevert);
    });

    it('should allow to add more than 256 owners', async function () {
        const obj = await Multiownable.new();

        await obj.addOwnersWithHowMany([
            0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10,
            0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20,
            0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D, 0x2E, 0x2F, 0x30,
            0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D, 0x3E, 0x3F, 0x40,
        ], 1).should.be.fulfilled;
        (await obj.ownersLength.call()).should.be.bignumber.equal(1 + 64);

        await obj.addOwnersWithHowMany([
            0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4A, 0x4B, 0x4C, 0x4D, 0x4E, 0x4F, 0x50,
            0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5A, 0x5B, 0x5C, 0x5D, 0x5E, 0x5F, 0x60,
            0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6A, 0x6B, 0x6C, 0x6D, 0x6E, 0x6F, 0x70,
            0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7A, 0x7B, 0x7C, 0x7D, 0x7E, 0x7F, 0x80,
        ], 1).should.be.fulfilled;
        (await obj.ownersLength.call()).should.be.bignumber.equal(1 + 64 * 2);

        await obj.addOwnersWithHowMany([
            0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8A, 0x8B, 0x8C, 0x8D, 0x8E, 0x8F, 0x90,
            0x91, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0x9B, 0x9C, 0x9D, 0x9E, 0x9F, 0xA0,
            0xA1, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xAB, 0xAC, 0xAD, 0xAE, 0xAF, 0xB0,
            0xB1, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0xBA, 0xBB, 0xBC, 0xBD, 0xBE, 0xBF, 0xC0,
        ], 1);
        (await obj.ownersLength.call()).should.be.bignumber.equal(1 + 64 * 3);

        await obj.addOwnersWithHowMany([
            0xC1, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9, 0xCA, 0xCB, 0xCC, 0xCD, 0xCE, 0xCF, 0xD0,
            0xD1, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xDB, 0xDC, 0xDD, 0xDE, 0xDF, 0xE0,
            0xE1, 0xE2, 0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xEB, 0xEC, 0xED, 0xEE, 0xEF, 0xF0,
            0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFB, 0xFC, 0xFD, 0xFE, 0xFF, 0x100,
        ], 1);
        (await obj.ownersLength.call()).should.be.bignumber.equal(1 + 64 * 4);

        await obj.addOwnersWithHowMany([
            0x141, 0x142, 0x143, 0x144, 0x145, 0x146, 0x147, 0x148, 0x149, 0x14A, 0x14B, 0x14C, 0x14D, 0x14E, 0x14F, 0x150,
            0x151, 0x152, 0x153, 0x154, 0x155, 0x156, 0x157, 0x158, 0x159, 0x15A, 0x15B, 0x15C, 0x15D, 0x15E, 0x15F, 0x160,
            0x161, 0x162, 0x163, 0x164, 0x165, 0x166, 0x167, 0x168, 0x169, 0x16A, 0x16B, 0x16C, 0x16D, 0x16E, 0x16F, 0x170,
            0x171, 0x172, 0x173, 0x174, 0x175, 0x176, 0x177, 0x178, 0x179, 0x17A, 0x17B, 0x17C, 0x17D, 0x17E, 0x17F, 0x180,
        ], 1).should.be.fulfilled;
        (await obj.ownersLength.call()).should.be.bignumber.equal(1 + 64 * 5);

        await obj.addOwnersWithHowMany([
            0x101, 0x102, 0x103, 0x104, 0x105, 0x106, 0x107, 0x108, 0x109, 0x10A, 0x10B, 0x10C, 0x10D, 0x10E, 0x10F, 0x110,
            0x111, 0x112, 0x113, 0x114, 0x115, 0x116, 0x117, 0x118, 0x119, 0x11A, 0x11B, 0x11C, 0x11D, 0x11E, 0x11F, 0x120,
            0x121, 0x122, 0x123, 0x124, 0x125, 0x126, 0x127, 0x128, 0x129, 0x12A, 0x12B, 0x12C, 0x12D, 0x12E, 0x12F, 0x130,
            0x131, 0x132, 0x133, 0x134, 0x135, 0x136, 0x137, 0x138, 0x139, 0x13A, 0x13B, 0x13C, 0x13D, 0x13E, 0x13F, 0x140,
        ], 1).should.be.fulfilled;
        (await obj.ownersLength.call()).should.be.bignumber.equal(1 + 64 * 6);

        await obj.addOwnersWithHowMany([
            0x1C1, 0x1C2, 0x1C3, 0x1C4, 0x1C5, 0x1C6, 0x1C7, 0x1C8, 0x1C9, 0x1CA, 0x1CB, 0x1CC, 0x1CD, 0x1CE, 0x1CF, 0x1D0,
            0x1D1, 0x1D2, 0x1D3, 0x1D4, 0x1D5, 0x1D6, 0x1D7, 0x1D8, 0x1D9, 0x1DA, 0x1DB, 0x1DC, 0x1DD, 0x1DE, 0x1DF, 0x1E0,
            0x1E1, 0x1E2, 0x1E3, 0x1E4, 0x1E5, 0x1E6, 0x1E7, 0x1E8, 0x1E9, 0x1EA, 0x1EB, 0x1EC, 0x1ED, 0x1EE, 0x1EF, 0x1F0,
            0x1F1, 0x1F2, 0x1F3, 0x1F4, 0x1F5, 0x1F6, 0x1F7, 0x1F8, 0x1F9, 0x1FA, 0x1FB, 0x1FC, 0x1FD, 0x1FE, 0x1FF, 0x200,
        ], 1);
        (await obj.ownersLength.call()).should.be.bignumber.equal(1 + 64 * 7);

        await obj.addOwnersWithHowMany([
            0x181, 0x182, 0x183, 0x184, 0x185, 0x186, 0x187, 0x188, 0x189, 0x18A, 0x18B, 0x18C, 0x18D, 0x18E, 0x18F, 0x190,
            0x191, 0x192, 0x193, 0x194, 0x195, 0x196, 0x197, 0x198, 0x199, 0x19A, 0x19B, 0x19C, 0x19D, 0x19E, 0x19F, 0x1A0,
            0x1A1, 0x1A2, 0x1A3, 0x1A4, 0x1A5, 0x1A6, 0x1A7, 0x1A8, 0x1A9, 0x1AA, 0x1AB, 0x1AC, 0x1AD, 0x1AE, 0x1AF, 0x1B0,
            0x1B1, 0x1B2, 0x1B3, 0x1B4, 0x1B5, 0x1B6, 0x1B7, 0x1B8, 0x1B9, 0x1BA, 0x1BB, 0x1BC, 0x1BD, 0x1BE, 0x1BF, 0x1C0,
        ], 1);
        (await obj.ownersLength.call()).should.be.bignumber.equal(1 + 64 * 8);
    });
});
