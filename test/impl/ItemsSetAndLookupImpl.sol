pragma solidity ^0.4.11;

import { ItemsSetAndLookup } from "../../contracts/ItemsSetAndLookup.sol";


contract ItemsSetAndLookupImpl {
    using ItemsSetAndLookup for ItemsSetAndLookup.Data;

    ItemsSetAndLookup.Data data;

    function length() public view returns(uint) {
        return data.length();
    }

    function at(uint index) public view returns(bytes32) {
        return data.at(index);
    }

    function contains(bytes32 item) public view returns(bool) {
        return data.contains(item);
    }

    function add(bytes32 item) public returns(bool) {
        return data.add(item);
    }

    function remove(bytes32 item) public returns(bool) {
        return data.remove(item);
    }

}