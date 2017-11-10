pragma solidity ^0.4.11;


contract Multiownable {

    // VARIABLES

    // Store owners and reverse lookup hash-table
    address[] public owners;
    mapping(address => uint) public ownersIndices; // Starts from 1
    
    // Store owners voting by pending operations and all operations array
    mapping(bytes32 => uint256) public pending;
    bytes32[] public allPendingOperations;
    
    // EVENTS

    event OwnershipTransferred(address[] previousOwners, address[] newOwners);

    // ACCESSORS

    function allPendingOperationsCount() public constant returns(uint) {
        return allPendingOperations.length;
    }

    function isOwner(address wallet) public constant returns(bool) {
        return ownersIndices[wallet] > 0;
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
        require(isOwner(msg.sender));

        uint ownerIndex = ownersIndices[msg.sender] - 1;
        bytes32 operation = keccak256(msg.data);
        if (pending[operation] == 0) {
            allPendingOperations.push(operation);
        }
        require((pending[operation] & (2 ** ownerIndex)) == 0);
        pending[operation] |= (2 ** ownerIndex);

        // If all owners confirm same operation
        if (pending[operation] == (2 ** owners.length) - 1) {
            deleteOperation(operation);
            _;
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
        delete pending[operation];
        for (uint i = 0; i < allPendingOperations.length; i++) {
            if (allPendingOperations[i] == operation) {
                allPendingOperations[i] = allPendingOperations[allPendingOperations.length - 1];
                allPendingOperations.length--;
                break;
            }
        }
    }

    // PUBLIC METHODS

    /**
    * @dev Allows owners to change their mind by cacnelling pending operations
    * @param operation defines which operation to delete
    */
    function cancelPending(bytes32 operation) public onlyAnyOwner {
        uint ownerIndex = ownersIndices[msg.sender] - 1;
        require((pending[operation] & (2 ** ownerIndex)) != 0);
        
        pending[operation] &= ~(2 ** ownerIndex);
        if (pending[operation] == 0) {
            deleteOperation(operation);
        }
    }

    /**
    * @dev Allows owners to change ownership
    * @param newOwners defines array of addresses of new owners
    */
    function transferOwnership(address[] newOwners) public onlyManyOwners {
        require(newOwners.length > 0);
        for (uint i = 0; i < newOwners.length; i++) {
            require(newOwners[i] != address(0));
        }

        OwnershipTransferred(owners, newOwners);

        // Reset owners array and index reverse lookup table
        for (i = 0; i < owners.length; i++) {
            delete ownersIndices[owners[i]];
        }
        for (i = 0; i < newOwners.length; i++) {
            ownersIndices[newOwners[i]] = i + 1;
        }
        owners = newOwners;

        // Discard all pendign operations
        for (i = 0; i < allPendingOperations.length; i++) {
            delete pending[allPendingOperations[i]];
        }
        allPendingOperations.length = 0;
    }

}