pragma solidity ^0.4.11;

import "../../contracts/Multiownable.sol";


contract MultiownableImpl is Multiownable {

    uint public value;

    function setValue(uint _value) public onlyManyOwners {
        value = _value;
    }

    function setValueAny(uint _value) public onlyAnyOwner {
        value = _value;
    }

    function setValueSome(uint _value, uint howMany) public onlySomeOwners(howMany) {
        value = _value;
    }

    function nestedFirst(uint _value) public onlyManyOwners {
        nestedSecond(_value);
    }

    function nestedSecond(uint _value) public onlyManyOwners {
        value = _value;
    }

    function nestedFirstManyToSome(uint _value, uint howMany) public onlyManyOwners {
        nestedSecondSome(_value, howMany);
    }

    function nestedFirstAnyToSome(uint _value, uint howMany) public onlyAnyOwner {
        nestedSecondSome(_value, howMany);
    }

    function nestedSecondSome(uint _value, uint howMany) public onlySomeOwners(howMany) {
        value = _value;
    }

}