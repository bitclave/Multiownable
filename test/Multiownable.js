// @flow
'use strict'

const BigNumber = web3.BigNumber;
const expect = require('chai').expect;
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(web3.BigNumber))
    .should();

import ether from './helpers/ether';
import {advanceBlock} from './helpers/advanceToBlock';
import {increaseTimeTo, duration} from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMThrow from './helpers/EVMThrow';

const Multiownable = artifacts.require('Multiownable.sol');
const MultiownableImpl = artifacts.require('./impl/MultiownableImpl.sol');

contract('Multiownable', function ([_, wallet1, wallet2, wallet3, wallet4, wallet5]) {

    it('should be initialized correctly', async function() {
        const obj = await Multiownable.new();

        (await obj.owners.call(0)).should.be.equal(_);
        await obj.owners.call(1).should.be.rejectedWith(EVMThrow);

        (await obj.isOwner.call(_)).should.be.true;
        (await obj.isOwner.call(wallet1)).should.be.false;
        (await obj.isOwner.call(wallet2)).should.be.false;
        (await obj.isOwner.call(wallet3)).should.be.false;
        (await obj.isOwner.call(wallet4)).should.be.false;
        (await obj.isOwner.call(wallet5)).should.be.false;
    })

    it('should transfer ownership 1 => 1 correctly', async function() {
        const obj = await Multiownable.new();

        await obj.transferOwnership([wallet1]);

        (await obj.owners.call(0)).should.be.equal(wallet1);
        await obj.owners.call(1).should.be.rejectedWith(EVMThrow);

        (await obj.isOwner.call(_)).should.be.false;
        (await obj.isOwner.call(wallet1)).should.be.true;
        (await obj.isOwner.call(wallet2)).should.be.false;
        (await obj.isOwner.call(wallet3)).should.be.false;
        (await obj.isOwner.call(wallet4)).should.be.false;
        (await obj.isOwner.call(wallet5)).should.be.false;
    })

    it('should transfer ownership 1 => 2 correctly', async function() {
        const obj = await Multiownable.new();

        await obj.transferOwnership([wallet1, wallet2]);

        (await obj.owners.call(0)).should.be.equal(wallet1);
        (await obj.owners.call(1)).should.be.equal(wallet2);
        await obj.owners.call(2).should.be.rejectedWith(EVMThrow);

        (await obj.isOwner.call(_)).should.be.false;
        (await obj.isOwner.call(wallet1)).should.be.true;
        (await obj.isOwner.call(wallet2)).should.be.true;
        (await obj.isOwner.call(wallet3)).should.be.false;
        (await obj.isOwner.call(wallet4)).should.be.false;
        (await obj.isOwner.call(wallet5)).should.be.false;
    })

    it('should transfer ownership 1 => 3 correctly', async function() {
        const obj = await Multiownable.new();

        await obj.transferOwnership([wallet1, wallet2, wallet3]);

        (await obj.owners.call(0)).should.be.equal(wallet1);
        (await obj.owners.call(1)).should.be.equal(wallet2);
        (await obj.owners.call(2)).should.be.equal(wallet3);
        await obj.owners.call(3).should.be.rejectedWith(EVMThrow);

        (await obj.isOwner.call(_)).should.be.false;
        (await obj.isOwner.call(wallet1)).should.be.true;
        (await obj.isOwner.call(wallet2)).should.be.true;
        (await obj.isOwner.call(wallet3)).should.be.true;
        (await obj.isOwner.call(wallet4)).should.be.false;
        (await obj.isOwner.call(wallet5)).should.be.false;
    })

    it('should transfer ownership 2 => 1 correctly', async function() {
        const obj = await Multiownable.new();

        await obj.transferOwnership([wallet1, wallet2]);
        await obj.transferOwnership([wallet3], {from: wallet1});
        await obj.transferOwnership([wallet3], {from: wallet2});
        
        (await obj.owners.call(0)).should.be.equal(wallet3);
        await obj.owners.call(1).should.be.rejectedWith(EVMThrow);

        (await obj.isOwner.call(_)).should.be.false;
        (await obj.isOwner.call(wallet1)).should.be.false;
        (await obj.isOwner.call(wallet2)).should.be.false;
        (await obj.isOwner.call(wallet3)).should.be.true;
        (await obj.isOwner.call(wallet4)).should.be.false;
        (await obj.isOwner.call(wallet5)).should.be.false;
    })

    it('should transfer ownership 3 => 1 correctly', async function() {
        const obj = await Multiownable.new();

        await obj.transferOwnership([wallet1, wallet2, wallet3]);
        await obj.transferOwnership([wallet4], {from: wallet1});
        await obj.transferOwnership([wallet4], {from: wallet2});
        await obj.transferOwnership([wallet4], {from: wallet3});
        
        (await obj.owners.call(0)).should.be.equal(wallet4);
        await obj.owners.call(1).should.be.rejectedWith(EVMThrow);

        (await obj.isOwner.call(_)).should.be.false;
        (await obj.isOwner.call(wallet1)).should.be.false;
        (await obj.isOwner.call(wallet2)).should.be.false;
        (await obj.isOwner.call(wallet3)).should.be.false;
        (await obj.isOwner.call(wallet4)).should.be.true;
        (await obj.isOwner.call(wallet5)).should.be.false;
    })

    it('should transfer ownership 2 => 2 correctly', async function() {
        const obj = await Multiownable.new();

        await obj.transferOwnership([wallet1, wallet2]);
        await obj.transferOwnership([wallet3, wallet4], {from: wallet1});
        await obj.transferOwnership([wallet3, wallet4], {from: wallet2});
        
        (await obj.owners.call(0)).should.be.equal(wallet3);
        (await obj.owners.call(1)).should.be.equal(wallet4);
        await obj.owners.call(2).should.be.rejectedWith(EVMThrow);

        (await obj.isOwner.call(_)).should.be.false;
        (await obj.isOwner.call(wallet1)).should.be.false;
        (await obj.isOwner.call(wallet2)).should.be.false;
        (await obj.isOwner.call(wallet3)).should.be.true;
        (await obj.isOwner.call(wallet4)).should.be.true;
        (await obj.isOwner.call(wallet5)).should.be.false;
    })

    it('should transfer ownership 2 => 3 correctly', async function() {
        const obj = await Multiownable.new();

        await obj.transferOwnership([wallet1, wallet2]);
        await obj.transferOwnership([wallet3, wallet4, wallet5], {from: wallet1});
        await obj.transferOwnership([wallet3, wallet4, wallet5], {from: wallet2});
        
        (await obj.owners.call(0)).should.be.equal(wallet3);
        (await obj.owners.call(1)).should.be.equal(wallet4);
        (await obj.owners.call(2)).should.be.equal(wallet5);
        await obj.owners.call(3).should.be.rejectedWith(EVMThrow);

        (await obj.isOwner.call(_)).should.be.false;
        (await obj.isOwner.call(wallet1)).should.be.false;
        (await obj.isOwner.call(wallet2)).should.be.false;
        (await obj.isOwner.call(wallet3)).should.be.true;
        (await obj.isOwner.call(wallet4)).should.be.true;
        (await obj.isOwner.call(wallet5)).should.be.true;
    })

    it('should transfer ownership 3 => 2 correctly', async function() {
        const obj = await Multiownable.new();

        await obj.transferOwnership([wallet1, wallet2, wallet3]);
        await obj.transferOwnership([wallet4, wallet5], {from: wallet1});
        await obj.transferOwnership([wallet4, wallet5], {from: wallet2});
        await obj.transferOwnership([wallet4, wallet5], {from: wallet3});
        
        (await obj.owners.call(0)).should.be.equal(wallet4);
        (await obj.owners.call(1)).should.be.equal(wallet5);
        await obj.owners.call(2).should.be.rejectedWith(EVMThrow);

        (await obj.isOwner.call(_)).should.be.false;
        (await obj.isOwner.call(wallet1)).should.be.false;
        (await obj.isOwner.call(wallet2)).should.be.false;
        (await obj.isOwner.call(wallet3)).should.be.false;
        (await obj.isOwner.call(wallet4)).should.be.true;
        (await obj.isOwner.call(wallet5)).should.be.true;
    })

    it('should correctly manage allPendingOperations array', async function() {
        const obj = await Multiownable.new();

        // Transfer ownership 1 => 1
        await obj.allPendingOperations.call(0).should.be.rejectedWith(EVMThrow);
        await obj.transferOwnership([wallet1]);
        await obj.allPendingOperations.call(0).should.be.rejectedWith(EVMThrow);
        
        // Transfer ownership 1 => 2
        await obj.allPendingOperations.call(0).should.be.rejectedWith(EVMThrow);
        await obj.transferOwnership([wallet2, wallet3], {from: wallet1});
        await obj.allPendingOperations.call(0).should.be.rejectedWith(EVMThrow);
        
        // Transfer ownership 2 => 2
        await obj.allPendingOperations.call(0).should.be.rejectedWith(EVMThrow);
        await obj.transferOwnership([wallet4, wallet5], {from: wallet2});
        await obj.allPendingOperations.call(0).should.be.fulfilled;
        await obj.allPendingOperations.call(1).should.be.rejectedWith(EVMThrow);
        await obj.transferOwnership([wallet4, wallet5], {from: wallet3});
        await obj.allPendingOperations.call(0).should.be.rejectedWith(EVMThrow);
    })

    it('should allow to cancel pending operations', async function() {
        const obj = await Multiownable.new();
        await obj.transferOwnership([wallet1, wallet2, wallet3]);
        
        // First owner agree
        await obj.transferOwnership([wallet4], {from: wallet1});
        await obj.allPendingOperations.call(0).should.be.fulfilled;
        
        // First owner disagree
        const operation1 = await obj.allPendingOperations.call(0);
        await obj.cancelPending(operation1, {from: wallet1});
        await obj.allPendingOperations.call(0).should.be.rejectedWith(EVMThrow);
        
        // First and Second owners agree
        await obj.transferOwnership([wallet4], {from: wallet1});
        await obj.allPendingOperations.call(0).should.be.fulfilled;
        await obj.allPendingOperations.call(1).should.be.rejectedWith(EVMThrow);
        await obj.transferOwnership([wallet4], {from: wallet2});
        await obj.allPendingOperations.call(0).should.be.fulfilled;
        await obj.allPendingOperations.call(1).should.be.rejectedWith(EVMThrow);
        
        // Second owner disagree
        const operation2 = await obj.allPendingOperations.call(0);
        await obj.cancelPending(operation2, {from: wallet2});
        await obj.allPendingOperations.call(0).should.be.fulfilled;
        await obj.allPendingOperations.call(1).should.be.rejectedWith(EVMThrow);
        
        // Third owner agree
        await obj.transferOwnership([wallet4], {from: wallet3});
        await obj.allPendingOperations.call(0).should.be.fulfilled;
        await obj.allPendingOperations.call(1).should.be.rejectedWith(EVMThrow);
        
        // Second owner agree
        await obj.transferOwnership([wallet4], {from: wallet2});
        await obj.allPendingOperations.call(0).should.be.rejectedWith(EVMThrow);
    })

    it('should reset all pending operations when owners change', async function() {
        const obj = await MultiownableImpl.new();
        await obj.transferOwnership([wallet1, wallet2]);
        
        await obj.setValue(1, {from: wallet1});
        await obj.allPendingOperations.call(0).should.be.fulfilled;
        await obj.allPendingOperations.call(1).should.be.rejectedWith(EVMThrow);
        
        await obj.transferOwnership([wallet3], {from: wallet1});
        await obj.allPendingOperations.call(0).should.be.fulfilled;
        await obj.allPendingOperations.call(1).should.be.fulfilled;
        await obj.allPendingOperations.call(2).should.be.rejectedWith(EVMThrow);
        
        await obj.transferOwnership([wallet3], {from: wallet2});
        await obj.allPendingOperations.call(0).should.be.rejectedWith(EVMThrow);
    })

    it('should handle multiple simultaneous operations correctly', async function() {
        const obj = await MultiownableImpl.new();
        await obj.transferOwnership([wallet1, wallet2]);
        
        // wallet1 => 1
        await obj.setValue(1, {from: wallet1});
        await obj.allPendingOperations.call(0).should.be.fulfilled;
        await obj.allPendingOperations.call(1).should.be.rejectedWith(EVMThrow);
        
        // Check value
        (await obj.value.call()).should.be.bignumber.equal(0);
        
        // wallet2 => 2
        await obj.setValue(2, {from: wallet2});
        await obj.allPendingOperations.call(0).should.be.fulfilled;
        await obj.allPendingOperations.call(1).should.be.fulfilled;
        await obj.allPendingOperations.call(2).should.be.rejectedWith(EVMThrow);
        
        // Check value
        (await obj.value.call()).should.be.bignumber.equal(0);
        
        // wallet1 => 2
        await obj.setValue(2, {from: wallet1});
        await obj.allPendingOperations.call(0).should.be.fulfilled;
        await obj.allPendingOperations.call(1).should.be.rejectedWith(EVMThrow);

        // Check value
        (await obj.value.call()).should.be.bignumber.equal(2);
        
        // wallet2 => 1
        await obj.setValue(1, {from: wallet2});
        await obj.allPendingOperations.call(0).should.be.rejectedWith(EVMThrow);

        // Check value
        (await obj.value.call()).should.be.bignumber.equal(1);
    })
    
})
