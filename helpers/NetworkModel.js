'use strict';

module.exports = NetworkModel;

function NetworkModel(networkId, provider, from, gasLimit, gasPrice) {
    this.network_id = networkId;
    this.provider = provider;
    this.from = from;
    this.gas = gasLimit || 4700000;
    this.gasPrice = gasPrice || 21000000000;
}
