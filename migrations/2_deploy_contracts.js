const Multiownable = artifacts.require('Multiownable');
const ItemsSetAndLookup = artifacts.require('ItemsSetAndLookup');

module.exports = async function (deployer) {
    Multiownable.link('ItemsSetAndLookup', (await ItemsSetAndLookup.new()).address);
    deployer.deploy(Multiownable);
};
