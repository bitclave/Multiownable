pragma solidity ^0.4.11;

import 'zeppelin-solidity/contracts/ownership/Ownable.sol';
import './Multiownable.sol';


contract MultiownableOverOwnable is Ownable, Multiownable {

    /**
    * @dev Allows to override Ownable onlyOwner modifier to onlyAnyOwner
    */
    modifier onlyOwner_overrideForAnyOwner {
        require(isOwner(msg.sender));
        owner = msg.sender;
        _;
    }

    /**
    * @dev Allows to override Ownable onlyOwner modifier to onlyManyOwners
    */
    modifier onlyOwner_overrideForManyOwners {
        if (insideOnlyManyOwners == msg.sender) {
            _;
        } else if (checkOnlyManyOwners()) {
            insideOnlyManyOwners = msg.sender;
            owner = msg.sender;
            _;
            insideOnlyManyOwners = address(0);
        }
    }

}