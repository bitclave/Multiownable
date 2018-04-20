pragma solidity ^0.4.23;


contract Multiownable {

    // VARIABLES

    uint256 public ownersGeneration;
    uint256 public howManyOwnersDecide;
    address[] public owners;
    bytes32[] public allOperations;
    address internal insideOnlyManyOwners;
    uint internal insideOnlyManyOwnersCount;

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
    * @dev Allows to perform method only after many owners call it with the same arguments
    */
    modifier onlyManyOwners {
        if (checkHowManyOwners(howManyOwnersDecide)) {
            bool update = (insideOnlyManyOwners == address(0));
            if (update) {
                insideOnlyManyOwners = msg.sender;
                insideOnlyManyOwnersCount = howManyOwnersDecide;
            }
            _;
            if (update) {
                insideOnlyManyOwners = address(0);
                insideOnlyManyOwnersCount = 0;
            }
        }
    }

    /**
    * @dev Allows to perform method only after all owners call it with the same arguments
    */
    modifier onlyAllOwners {
        if (checkHowManyOwners(owners.length)) {
            bool update = (insideOnlyManyOwners == address(0));
            if (update) {
                insideOnlyManyOwners = msg.sender;
                insideOnlyManyOwnersCount = owners.length;
            }
            _;
            if (update) {
                insideOnlyManyOwners = address(0);
                insideOnlyManyOwnersCount = 0;
            }
        }
    }

    /**
    * @dev Allows to perform method only after some owners call it with the same arguments
    */
    modifier onlySomeOwners(uint howMany) {
        require(howMany > 0);
        require(howMany <= owners.length);
        
        if (checkHowManyOwners(howMany)) {
            bool update = (insideOnlyManyOwners == address(0));
            if (update) {
                insideOnlyManyOwners = msg.sender;
                insideOnlyManyOwnersCount = howMany;
            }
            _;
            if (update) {
                insideOnlyManyOwners = address(0);
                insideOnlyManyOwnersCount = 0;
            }
        }
    }

    // CONSTRUCTOR

    constructor() public {
        owners.push(msg.sender);
        ownersIndices[msg.sender] = 1;
        howManyOwnersDecide = 1;
    }

    // INTERNAL METHODS

    /**
     * @dev onlyManyOwners modifier helper
     */
    function checkHowManyOwners(uint howMany) internal returns(bool) {
        require(isOwner(msg.sender));

        if (insideOnlyManyOwners == msg.sender && howMany <= insideOnlyManyOwnersCount) {
            return true;
        }

        uint ownerIndex = ownersIndices[msg.sender] - 1;
        bytes32 operation = keccak256(msg.data, ownersGeneration);

        if (votesMaskByOperation[operation] == 0) {
            allOperationsIndicies[operation] = allOperations.length;
            allOperations.push(operation);
        }
        require((votesMaskByOperation[operation] & (2 ** ownerIndex)) == 0);
        votesMaskByOperation[operation] |= (2 ** ownerIndex);
        votesCountByOperation[operation] += 1;

        // If all owners confirm same operation
        if (votesCountByOperation[operation] == howMany) {
            deleteOperation(operation);
            insideOnlyManyOwners = msg.sender;
            insideOnlyManyOwnersCount = howMany;
            return true;
        }
        return false;
    }

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

        emit OwnershipTransferred(owners, newOwners);

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
        allOperations.length = 0;
        ownersGeneration++;
    }

}
