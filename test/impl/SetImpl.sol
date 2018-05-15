pragma solidity ^0.4.11;

import { Set } from "../../contracts/Set.sol";


contract SetImpl {
    using Set for Set.Data;

    Set.Data data;

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