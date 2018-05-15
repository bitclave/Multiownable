const Multiownable = artifacts.require('Multiownable');
const Set = artifacts.require('Set');

module.exports = async function (deployer) {
    Multiownable.link('Set', (await Set.new()).address);
    deployer.deploy(Multiownable);
};
