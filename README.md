# Multiownable

[![Build Status](https://travis-ci.org/bitclave/Multiownable.svg?branch=master)](https://travis-ci.org/bitclave/Multiownable)
[![Coverage Status](https://coveralls.io/repos/github/bitclave/Multiownable/badge.svg)](https://coveralls.io/github/bitclave/Multiownable)

BitClave implementation of Multiownable contract as improvement to OpenZeppelin Ownable contract

# Installation

1. Install [truffle](http://truffleframework.com) globally with `npm install -g truffle`
2. Install [ganache-cli](https://github.com/trufflesuite/ganache-cli) globally with `npm install -g ganache-cli`
3. Install local packages with `npm install`
4. Run ganache in separate terminal `scripts/rpc.sh`
5. Run tests with `npm test`

On macOS you also need to install watchman: `brew install watchman`

# Features

1. Supports up to 256 simultaneous owners
2. Simple usage: add modifiers `onlyAnyOwner` and `onlyManyOwners`
3. Supports multiple pending operations
4. Allows owners to cancel pending operations
5. Reset all pending operations on ownership transfering

# Example of multisig wallet

```solidity
contract SimplestMultiWallet is Multiownable {

    bool avoidReentrancy = false;

    function () public payable {
    }

    function transferTo(address to, uint256 amount) public onlyManyOwners {
        require(!avoidReentrancy);
        avoidReentrancy = true;
        to.transfer(amount);
        avoidReentrancy = false;
    }
    
}
```

# Example of multisig wallet with ERC20 tokens support

```solidity
contract SimplestTokensMultiWallet is Multiownable {

    bool avoidReentrancy = false;

    function () public payable {
    }
    
    function transferTo(address to, uint256 amount) public onlyManyOwners {
        require(!avoidReentrancy);
        avoidReentrancy = true;
        to.transfer(amount);
        avoidReentrancy = false;
    }
    
    function transferTokensTo(address token, address to, uint256 amount) public onlyManyOwners {
        require(!avoidReentrancy);
        avoidReentrancy = true;
        ERC20(token).transfer(to, amount);
        avoidReentrancy = false;
    }
    
}
```
