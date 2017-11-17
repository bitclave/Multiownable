pragma solidity ^0.4.11;


contract Multiownable {

    // VARIABLES

    address[] public owners;
    bytes32[] public allOperations;
    bool insideOnlyManyOwners = false;
    
    // Reverse lookup table for owners
    mapping(address => uint) public ownersIndices; // Starts from 1
    
    // Owners voting mask per operations
    mapping(bytes32 => uint256) public votesMaskByOperation;
    
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
        if (insideOnlyManyOwners) {
            _;
            return;
        }
        require(isOwner(msg.sender));

        uint ownerIndex = ownersIndices[msg.sender] - 1;
        bytes32 operation = keccak256(msg.data);
        
        if (votesMaskByOperation[operation] == 0) {
            allOperations.push(operation);
        }
        require((votesMaskByOperation[operation] & (2 ** ownerIndex)) == 0);
        votesMaskByOperation[operation] |= (2 ** ownerIndex);

        // If all owners confirm same operation
        if (votesMaskByOperation[operation] == (2 ** owners.length) - 1) {
            insideOnlyManyOwners = true;
            _;
            insideOnlyManyOwners = false;
            deleteOperation(operation);
        }
    }

    // CONSTRUCTOR

    function Multiownable() public {
        owners.push(msg.sender);
        ownersIndices[msg.sender] = 1;
    }

    // INTERNAL METHODS

    /**
    * @dev Used to delete cancelled or performed operation
    * @param operation defines which operation to delete
    */
    function deleteOperation(bytes32 operation) internal {
        delete votesMaskByOperation[operation];
        for (uint i = 0; i < allOperations.length; i++) {
            if (allOperations[i] == operation) {
                allOperations[i] = allOperations[allOperations.length - 1];
                allOperations.length--;
                break;
            }
        }
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
        if (votesMaskByOperation[operation] == 0) {
            deleteOperation(operation);
        }
    }

    /**
    * @dev Allows owners to change ownership
    * @param newOwners defines array of addresses of new owners
    */
    function transferOwnership(address[] newOwners) public onlyManyOwners {
        require(newOwners.length > 0);
        require(newOwners.length <= 256);
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

        // Discard all pendign operations
        for (i = 0; i < allOperations.length; i++) {
            delete votesMaskByOperation[allOperations[i]];
        }
        allOperations.length = 0;
    }

}