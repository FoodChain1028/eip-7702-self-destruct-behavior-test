// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract SimpleDelegation {
    event Executed(address indexed to, uint256 value, bytes data);

    struct Call {
        bytes data;
        address to;
        uint256 value;
    }

    function destroy() public payable {
        selfdestruct(payable(msg.sender));
    }

    receive() external payable {}
}
