const Multiownable = artifacts.require("Multiownable");

module.exports = function(deployer) {
    deployer.deploy(Multiownable);
};
