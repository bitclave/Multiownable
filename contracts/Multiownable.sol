pragma solidity ^0.4.11;


contract Multiownable {

    address[] public owners;
    mapping(address => uint) public ownersIndexes; // Counts from 1
    
    mapping(bytes32 => uint256) public pending;
    bytes32[] public allPendingOperations;
    
    event OwnershipTransferred(address[] previousOwner, address[] newOwner);

    function allPendingOperationsCount() public returns(uint) {
        return allPendingOperations.length;
    }

    function Multiownable() public {
        owners.push(msg.sender);
        ownersIndexes[msg.sender] = 1;
    }

    modifier onlyAnyOwner {
        require(isOwner(msg.sender));
        _;
    }

    modifier onlyManyOwners {
        require(isOwner(msg.sender));

        uint ownerIndex = ownersIndexes[msg.sender] - 1;
        bytes32 operation = sha3(msg.data);
        if (pending[operation] == 0) {
            allPendingOperations.push(operation);
        }
        require((pending[operation] & (2 ** ownerIndex)) == 0);
        pending[operation] |= (2 ** ownerIndex);

        // If all owners confirm same operation
        if (pending[operation] == (2 ** owners.length) - 1) {
            _;
            deleteOperation(operation);
        }
    }

    function isOwner(address wallet) public constant returns(bool) {
        return ownersIndexes[wallet] > 0;
    }

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

    function cancelPending(bytes32 operation) public onlyAnyOwner {
        uint ownerIndex = ownersIndexes[msg.sender] - 1;
        require((pending[operation] & (2 ** ownerIndex)) != 0);
        
        pending[operation] &= ~(2 ** ownerIndex);
        if (pending[operation] == 0) {
            deleteOperation(operation);
        }
    }

    function transferOwnership(address[] newOwners) public onlyManyOwners {
        require(newOwners.length > 0);
        for (uint i = 0; i < newOwners.length; i++) {
            require(newOwners[i] != address(0));
        }

        OwnershipTransferred(owners, newOwners);

        // Reset owners array and index reverse lookup table
        for (i = 0; i < owners.length; i++) {
            delete ownersIndexes[owners[i]];
        }
        for (i = 0; i < newOwners.length; i++) {
            ownersIndexes[newOwners[i]] = i + 1;
        }
        owners = newOwners;

        // Discard all pendign operations
        for (i = 0; i < allPendingOperations.length; i++) {
            delete pending[allPendingOperations[i]];
        }
        allPendingOperations.length = 0;
    }

}