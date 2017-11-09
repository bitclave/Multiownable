pragma solidity ^0.4.11;

import "../../contracts/Multiownable.sol";


contract MultiownableImpl is Multiownable {

    uint public value;

    function setValue(uint _value) public onlyManyOwners {
        value = _value;
    }

}