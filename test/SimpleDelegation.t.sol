// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console, Vm} from "forge-std/Test.sol";
import {SimpleDelegation} from "../src/SimpleDelegation.sol";

// Observing behavior EIP-7702 && self destruct
contract SignDelegationTest is Test {
    // Alice's address and private key (EOA with no initial contract code).
    address payable ALICE_ADDRESS = payable(0x70997970C51812dc3A010C7d01b50e0d17dc79C8);
    uint256 constant ALICE_PK = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;

    // Bob's address and private key (Bob will execute transactions on Alice's behalf).
    address constant BOB_ADDRESS = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    uint256 constant BOB_PK = 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a;

    // The contract that Alice will delegate execution to.
    SimpleDelegation  public delegation;

    function setUp() public {
        // Deploy the delegation contract (Alice will delegate calls to this contract).
        delegation = new SimpleDelegation();
    }

    function testDelegationSelfDestruct() public {
        // Fund Alice's account to have some ETH for testing
        vm.deal(ALICE_ADDRESS, 1 ether);

        // Check initial balances
        uint256 aliceInitialBalance = ALICE_ADDRESS.balance;
        uint256 bobInitialBalance = BOB_ADDRESS.balance;

        console.log("\nInitial balances:");
        console.log("  Alice:", aliceInitialBalance);
        console.log("  Bob:", bobInitialBalance);
        
        // Alice signs a delegation allowing `delegation` to execute transactions on her behalf
        vm.signAndAttachDelegation(address(delegation), ALICE_PK);
        
        // Verify that Alice's account now temporarily behaves as a smart contract
        bytes memory code = address(ALICE_ADDRESS).code;
        require(code.length > 0, "no code written to Alice");

        // Check EOA code
        bytes memory codeBeforeDestroy = address(ALICE_ADDRESS).code;
        console.log("\nCode lengths before destroy:");
        console.log("  Alice's code length:", codeBeforeDestroy.length);

        // Bob triggers destroy on Alice
        vm.prank(BOB_ADDRESS); 
        SimpleDelegation(ALICE_ADDRESS).destroy();

        // Check the final state
        console.log("\nFinal balances after destroy (self destruct):");
        console.log("  Alice:", ALICE_ADDRESS.balance);
        console.log("  Bob:", BOB_ADDRESS.balance);
                
        // Check EOA code
        bytes memory codeAfterDestroy = address(ALICE_ADDRESS).code;
        console.log("\nCode lengths after destroy:");
        console.log("  Alice's code length:", codeAfterDestroy.length);

        if (codeAfterDestroy.length > 0) {
            console.log("\nAlice's code bytes:");
            console.logBytes(codeAfterDestroy);
        }
    }

}
