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

const MultiAttackable = artifacts.require('./impl/MultiAttackable.sol');
const MultiAttacker = artifacts.require('./impl/MultiAttacker.sol');

contract('MultiAttack', function ([_, wallet1, wallet2, wallet3, wallet4, wallet5]) {

    it('should handle reentracy attack', async function() {
        const victim = await MultiAttackable.new();
        const hacker = await MultiAttacker.new();

        // Prepare victim wallet
        await victim.transferOwnership([wallet1, wallet2]);
        await web3.eth.sendTransaction({from: _, to: victim.address, value: ether(3)});

        // Try reentrace attack
        await victim.transferTo(hacker.address, ether(1), {from: wallet1});
        await victim.transferTo(hacker.address, ether(1), {from: wallet2}).should.be.rejectedWith(EVMThrow);

        (await web3.eth.getBalance(victim.address)).should.be.bignumber.equal(ether(3));
    })

})