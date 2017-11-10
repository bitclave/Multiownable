pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/MintableToken.sol";
import "../../contracts/MultiownableOverOwnable.sol";


contract MultisigMintableToken is MintableToken, MultiownableOverOwnable {

    // Only all owners can mint
    function mint(address _to, uint256 _amount) onlyOwner_overrideForManyOwners canMint public returns (bool) {
        return super.mint(_to, _amount);
    }

    // Any of the owners can finish
    function finishMinting() onlyOwner_overrideForAnyOwner public returns (bool) {
        return super.finishMinting();
    }

}