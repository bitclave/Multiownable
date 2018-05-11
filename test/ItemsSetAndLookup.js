// @flow

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(web3.BigNumber))
    .should();

const ItemsSetAndLookup = artifacts.require('ItemsSetAndLookup');
const ItemsSetAndLookupImpl = artifacts.require('ItemsSetAndLookupImpl');

const value1 = 'abcdefghijklmnopqrstuvwxyz123456';
const value2 = 'abcdefghijklmnopqrstuvwxyz123457';
const value3 = 'abcdefghijklmnopqrstuvwxyz123458';

contract('ItemsSetAndLookup', function ([_, wallet1, wallet2, wallet3, wallet4, wallet5]) {
    before(async function () {
        ItemsSetAndLookupImpl.link('ItemsSetAndLookup', (await ItemsSetAndLookup.new()).address);
    });

    it('should init correctly', async function () {
        const set = await ItemsSetAndLookupImpl.new();

        (await set.length.call()).should.be.bignumber.equal(0);
        (await set.contains.call(value1)).should.be.false;
        (await set.contains.call(value2)).should.be.false;
        (await set.contains.call(value3)).should.be.false;
    });

    describe('add', async function () {
        it('should add first item', async function () {
            const set = await ItemsSetAndLookupImpl.new();

            await set.add(value1);

            (await set.length.call()).should.be.bignumber.equal(1);
            (await set.contains.call(value1)).should.be.true;
            (await set.contains.call(value2)).should.be.false;
            (await set.contains.call(value3)).should.be.false;
            web3.toAscii(await set.at.call(0)).should.be.equal(value1);
        });

        it('should add two different items', async function () {
            const set = await ItemsSetAndLookupImpl.new();

            await set.add(value1);
            await set.add(value2);

            (await set.length.call()).should.be.bignumber.equal(2);
            (await set.contains.call(value1)).should.be.true;
            (await set.contains.call(value2)).should.be.true;
            (await set.contains.call(value3)).should.be.false;
            web3.toAscii(await set.at.call(0)).should.be.equal(value1);
            web3.toAscii(await set.at.call(1)).should.be.equal(value2);
        });

        it('should add three different items', async function () {
            const set = await ItemsSetAndLookupImpl.new();

            await set.add(value1);
            await set.add(value2);
            await set.add(value3);

            (await set.length.call()).should.be.bignumber.equal(3);
            (await set.contains.call(value1)).should.be.true;
            (await set.contains.call(value2)).should.be.true;
            (await set.contains.call(value3)).should.be.true;
            web3.toAscii(await set.at.call(0)).should.be.equal(value1);
            web3.toAscii(await set.at.call(1)).should.be.equal(value2);
            web3.toAscii(await set.at.call(2)).should.be.equal(value3);
        });

        it('should not add existing item to 1 item', async function () {
            const set = await ItemsSetAndLookupImpl.new();

            await set.add(value1);
            await set.add(value1);

            (await set.length.call()).should.be.bignumber.equal(1);
            (await set.contains.call(value1)).should.be.true;
            (await set.contains.call(value2)).should.be.false;
            (await set.contains.call(value3)).should.be.false;
            web3.toAscii(await set.at.call(0)).should.be.equal(value1);
        });

        it('should not add existing item to 2 items (1)', async function () {
            const set = await ItemsSetAndLookupImpl.new();

            await set.add(value1);
            await set.add(value2);
            await set.add(value1);

            (await set.length.call()).should.be.bignumber.equal(2);
            (await set.contains.call(value1)).should.be.true;
            (await set.contains.call(value2)).should.be.true;
            (await set.contains.call(value3)).should.be.false;
            web3.toAscii(await set.at.call(0)).should.be.equal(value1);
            web3.toAscii(await set.at.call(1)).should.be.equal(value2);
        });

        it('should not add existing item to 2 items (2)', async function () {
            const set = await ItemsSetAndLookupImpl.new();

            await set.add(value1);
            await set.add(value2);
            await set.add(value2);

            (await set.length.call()).should.be.bignumber.equal(2);
            (await set.contains.call(value1)).should.be.true;
            (await set.contains.call(value2)).should.be.true;
            (await set.contains.call(value3)).should.be.false;
            web3.toAscii(await set.at.call(0)).should.be.equal(value1);
            web3.toAscii(await set.at.call(1)).should.be.equal(value2);
        });
    });

    describe('remove', async function () {
        it('should delete 1 of 1 items', async function () {
            const set = await ItemsSetAndLookupImpl.new();

            await set.add(value1);
            await set.remove(value1);

            (await set.length.call()).should.be.bignumber.equal(0);
            (await set.contains.call(value1)).should.be.false;
            (await set.contains.call(value2)).should.be.false;
            (await set.contains.call(value3)).should.be.false;
        });

        it('should delete first of 2 items', async function () {
            const set = await ItemsSetAndLookupImpl.new();

            await set.add(value1);
            await set.add(value2);
            await set.remove(value1);

            (await set.length.call()).should.be.bignumber.equal(1);
            (await set.contains.call(value1)).should.be.false;
            (await set.contains.call(value2)).should.be.true;
            (await set.contains.call(value3)).should.be.false;
            web3.toAscii(await set.at.call(0)).should.be.equal(value2);
        });

        it('should delete last of 2 items', async function () {
            const set = await ItemsSetAndLookupImpl.new();

            await set.add(value1);
            await set.add(value2);
            await set.remove(value2);

            (await set.length.call()).should.be.bignumber.equal(1);
            (await set.contains.call(value1)).should.be.true;
            (await set.contains.call(value2)).should.be.false;
            (await set.contains.call(value3)).should.be.false;
            web3.toAscii(await set.at.call(0)).should.be.equal(value1);
        });

        it('should delete mid of 3 items', async function () {
            const set = await ItemsSetAndLookupImpl.new();

            await set.add(value1);
            await set.add(value2);
            await set.add(value3);
            await set.remove(value2);

            (await set.length.call()).should.be.bignumber.equal(2);
            (await set.contains.call(value1)).should.be.true;
            (await set.contains.call(value2)).should.be.false;
            (await set.contains.call(value3)).should.be.true;
            web3.toAscii(await set.at.call(0)).should.be.equal(value1);
            web3.toAscii(await set.at.call(1)).should.be.equal(value3);
        });

        it('should not delete not existing item', async function () {
            const set = await ItemsSetAndLookupImpl.new();

            await set.add(value1);
            await set.add(value2);
            await set.remove(value3);

            (await set.length.call()).should.be.bignumber.equal(2);
            (await set.contains.call(value1)).should.be.true;
            (await set.contains.call(value2)).should.be.true;
            (await set.contains.call(value3)).should.be.false;
            web3.toAscii(await set.at.call(0)).should.be.equal(value1);
            web3.toAscii(await set.at.call(1)).should.be.equal(value2);
        });
    });
});
