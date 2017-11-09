require('babel-register');
require('babel-polyfill');
const Provider = require('./helpers/Provider');
const ProviderRopsten = Provider.createRopstenNetwork("type here your private key from owner address");
const ProviderMain = Provider.createMainNetwork("type here your private key from owner address");
const ProviderTestRpc = Provider.createTestRpcNetwork("type here your private key from owner address");

module.exports = {
    networks: {
        ropsten: ProviderRopsten.getNetwork(),
        mainnet: ProviderMain.getNetwork(),
        testrpc: ProviderTestRpc.getNetwork(),
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*",
            gas: 6000000
        },
        coverage: {
            host: "localhost",
            port: 8555,
            network_id: "*",
            gas: 0xffffffff
        }
    }
};
