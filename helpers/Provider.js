'use strict';

/**
 * This class will be use only for deploy!
 * Because: Web3ProviderEngine does not support synchronous requests.
 */
module.exports = Provider;

const NetworkModel = require('../helpers/NetworkModel');
const Wallet = require('ethereumjs-wallet');
const ProviderEngine = require('web3-provider-engine');
const WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
const Web3Subprovider = require('web3-provider-engine/subproviders/web3.js');
const Web3 = require('web3');
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');

const NETWORK_INFURA_MAIN = 'https://mainnet.infura.io/';
const NETWORK_INFURA_ROPSTEN = 'https://ropsten.infura.io/';
const NETWORK_TESTRPC = 'http://localhost:8545';
const NETWORK_ID_MAIN = 1;
const NETWORK_ID_ROPSTEN = 3;
const NETWORK_ID_TESTRPC = '*';

Provider.createMainNetwork = function (privateKey) {
    return new Provider(new NetworkModel(NETWORK_ID_MAIN), NETWORK_INFURA_MAIN, privateKey);
};

Provider.createRopstenNetwork = function (privateKey) {
    return new Provider(new NetworkModel(NETWORK_ID_ROPSTEN), NETWORK_INFURA_ROPSTEN, privateKey);
};

Provider.createTestRpcNetwork = function (privateKey) {
    return new Provider(new NetworkModel(NETWORK_ID_TESTRPC), NETWORK_TESTRPC, privateKey);
};

function Provider(networkModel, networkUrl, privateKey) {
    try {
        const wallet = new Wallet(new Buffer(privateKey, 'hex'));
        const engine = new ProviderEngine();
        engine.addProvider(new FilterSubprovider());
        engine.addProvider(new WalletSubprovider(wallet, {}));
        engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(networkUrl)));
        networkModel.from = '0x' + wallet.getAddress().toString('hex');
        networkModel.provider = engine;
        this._network = networkModel;

    } catch (e) {
        if (e.message.search('Private key does not satisfy') > -1
            || e.message.search('Invalid hex string') > -1) {
            console.log(networkUrl, 'incorrect private key');
        } else {
            console.log(networkUrl, e);
        }
    }
}

Provider.prototype.getNetwork = function () {
    if (this._network) {
        this._network.provider.start();
    }

    return this._network;
};

Provider.prototype.stop = function () {
    if (this._network) {
        this._network.provider.stop();
    }
};
