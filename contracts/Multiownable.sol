pragma solidity ^0.4.11;


contract Multiownable {

    // VARIABLES

    uint256 public howManyOwnersDecide;
    address[] public owners;
    bytes32[] public allOperations;
    address insideOnlyManyOwners;

    // Reverse lookup tables for owners and allOperations
    mapping(address => uint) ownersIndices; // Starts from 1
    mapping(bytes32 => uint) allOperationsIndicies;

    // Owners voting mask per operations
    mapping(bytes32 => uint256) public votesMaskByOperation;
    mapping(bytes32 => uint256) public votesCountByOperation;

    // EVENTS

    event OwnershipTransferred(address[] previousOwners, address[] newOwners);

    // ACCESSORS

    function isOwner(address wallet) public constant returns(bool) {
        return ownersIndices[wallet] > 0;
    }

    function ownersCount() public constant returns(uint) {
        return owners.length;
    }

    function allOperationsCount() public constant returns(uint) {
        return allOperations.length;
    }

    // MODIFIERS

    /**
    * @dev Allows to perform method by any of the owners
    */
    modifier onlyAnyOwner {
        require(isOwner(msg.sender));
        _;
    }

    /**
    * @dev Allows to perform method only after all owners call it with the same arguments
    */
    modifier onlyManyOwners {
        if (insideOnlyManyOwners == msg.sender) {
            _;
            return;
        }
        require(isOwner(msg.sender));

        uint ownerIndex = ownersIndices[msg.sender] - 1;
        bytes32 operation = keccak256(msg.data);

        if (votesMaskByOperation[operation] == 0) {
            allOperationsIndicies[operation] = allOperations.length;
            allOperations.push(operation);
        }
        require((votesMaskByOperation[operation] & (2 ** ownerIndex)) == 0);
        votesMaskByOperation[operation] |= (2 ** ownerIndex);
        votesCountByOperation[operation] += 1;

        // If all owners confirm same operation
        if (votesCountByOperation[operation] == howManyOwnersDecide) {
            deleteOperation(operation);
            insideOnlyManyOwners = msg.sender;
            _;
            insideOnlyManyOwners = address(0);
        }
    }

    // CONSTRUCTOR

    function Multiownable() public {
        owners.push(msg.sender);
        ownersIndices[msg.sender] = 1;
        howManyOwnersDecide = 1;
    }

    // INTERNAL METHODS

    /**
    * @dev Used to delete cancelled or performed operation
    * @param operation defines which operation to delete
    */
    function deleteOperation(bytes32 operation) internal {
        uint index = allOperationsIndicies[operation];
        if (index < allOperations.length - 1) {
            allOperations[index] = allOperations[allOperations.length - 1];
            allOperationsIndicies[allOperations[index]] = index;
        }
        allOperations.length--;

        delete votesMaskByOperation[operation];
        delete votesCountByOperation[operation];
        delete allOperationsIndicies[operation];
    }

    // PUBLIC METHODS

    /**
    * @dev Allows owners to change their mind by cacnelling votesMaskByOperation operations
    * @param operation defines which operation to delete
    */
    function cancelPending(bytes32 operation) public onlyAnyOwner {
        uint ownerIndex = ownersIndices[msg.sender] - 1;
        require((votesMaskByOperation[operation] & (2 ** ownerIndex)) != 0);

        votesMaskByOperation[operation] &= ~(2 ** ownerIndex);
        votesCountByOperation[operation]--;
        if (votesCountByOperation[operation] == 0) {
            deleteOperation(operation);
        }
    }

    /**
    * @dev Allows owners to change ownership
    * @param newOwners defines array of addresses of new owners
    */
    function transferOwnership(address[] newOwners) public {
        transferOwnershipWithHowMany(newOwners, newOwners.length);
    }

    /**
    * @dev Allows owners to change ownership
    * @param newOwners defines array of addresses of new owners
    * @param newHowManyOwnersDecide defines how many owners can decide
    */
    function transferOwnershipWithHowMany(address[] newOwners, uint256 newHowManyOwnersDecide) public onlyManyOwners {
        require(newOwners.length > 0);
        require(newOwners.length <= 256);
        require(newHowManyOwnersDecide > 0);
        require(newHowManyOwnersDecide <= newOwners.length);
        for (uint i = 0; i < newOwners.length; i++) {
            require(newOwners[i] != address(0));
        }

        OwnershipTransferred(owners, newOwners);

        // Reset owners array and index reverse lookup table
        for (i = 0; i < owners.length; i++) {
            delete ownersIndices[owners[i]];
        }
        for (i = 0; i < newOwners.length; i++) {
            require(ownersIndices[newOwners[i]] == 0);
            ownersIndices[newOwners[i]] = i + 1;
        }
        owners = newOwners;
        howManyOwnersDecide = newHowManyOwnersDecide;

        // Discard all pendign operations
        for (i = 0; i < allOperations.length; i++) {
            delete votesMaskByOperation[allOperations[i]];
            delete votesCountByOperation[allOperations[i]];
            delete allOperationsIndicies[allOperations[i]];
        }
        allOperations.length = 0;
    }

}
