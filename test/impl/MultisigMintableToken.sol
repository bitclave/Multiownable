pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "../../contracts/MultiownableOverOwnable.sol";


contract MintableTokenExt is MintableToken {

    uint public value = 0;

    function nestedFirst(uint _value) public onlyOwner {
        nestedSecond(_value);
    }

    function nestedSecond(uint _value) public onlyOwner {
        value = _value;
    }

}


contract MultisigMintableToken is MintableTokenExt, MultiownableOverOwnable {

    // Only all owners can mint
    function mint(address _to, uint256 _amount) onlyOwner_overrideForManyOwners canMint public returns (bool) {
        return super.mint(_to, _amount);
    }

    // Any of the owners can finish
    function finishMinting() onlyOwner_overrideForAnyOwner public returns (bool) {
        return super.finishMinting();
    }

    function nestedFirst(uint _value) public onlyOwner_overrideForManyOwners {
        super.nestedFirst(_value);
    }

    function nestedSecond(uint _value) public onlyOwner_overrideForManyOwners {
        super.nestedSecond(_value);
    }

}