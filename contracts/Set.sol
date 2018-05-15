pragma solidity ^0.4.23;


library Set {

    struct Data {
        bytes32[] items;
        mapping(bytes32 => uint) lookup;
    }

    function length(Data storage s) internal view returns(uint) {
        return s.items.length;
    }

    function at(Data storage s, uint index) internal view returns(bytes32) {
        return s.items[index];
    }

    function contains(Data storage s, bytes32 item) internal view returns(bool) {
        return s.lookup[item] != 0;
    }

    function add(Data storage s, bytes32 item) public returns(bool) {
        if (s.lookup[item] > 0) {
            return false;
        }
        s.lookup[item] = s.items.push(item);
        return true;
    }

    function remove(Data storage s, bytes32 item) public returns(bool) {
        uint index = s.lookup[item];
        if (index == 0) {
            return false;
        }
        if (index < s.items.length) {
            bytes32 lastItem = s.items[s.items.length - 1];
            s.items[index - 1] = lastItem;
            s.lookup[lastItem] = index;
        }
        s.items.length -= 1;
        delete s.lookup[item];
        return true;
    }

}
