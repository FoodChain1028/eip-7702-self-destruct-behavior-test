## Run foundry test

Run forge test:

```bash
forge build
```

and

```bash
forge test -vv
```

The result:

```bash
Initial balances:
    Alice: 1000000000000000000
    Bob: 0
  
Code lengths before destroy:
    Alice's code length: 23
  
Final balances after destroy (self destruct):
    Alice: 0
    Bob: 1000000000000000000
  
Code lengths after destroy:
    Alice's code length: 23
  
Alice's code bytes:
  0xef01005615deb798bb3e4dfa0139dfa1b3d433cc23b72f
```

## Run TypeScript Test (using `viem`)

Before running all these, make sure you have run `forge build`.

Run the test where EIP-7702 and destroy are in the same tx.

```bash
1. Install dependencies:
    yarn install
2. Start Anvil with Odyssey flag:
    anvil --odyssey
3. Run the test script:
    yarn test-same-tx
```

The result would be something like this:

```bash
yarn test-same-tx                                                                                                                                                self_destruct_eip_7702 -> main ? !
yarn run v1.22.22
warning package.json: No license field
$ tsx script/SelfDestructInSameTx.ts
=== Testing EIP-7702 Self-Destruct Behavior (Sending in the same Tx) ===

Checking if Anvil is running...
✅ Connected to Anvil
✅ Alice's code BEFORE DESTROY: 0x
✅ Alice's balance BEFORE DESTROY: 1
✅ Bob's balance BEFORE DESTROY: 1

Deploying SimpleDelegation contract...
✅ SimpleDelegation deployed at address: 0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0

Signing authorization message for Alice...

1. Bob send a transaction to Alice.destroy() with a EIP-7702 tx (EIP-7702 tx & selfdestroy in the same tx)...

Observation of code and balance of Alice and Bob...
✅ Alice's code AFTER DESTROY: 0xef01009fe46736679d2d9a65f0992f2272de9f3c7fa6e0
✅ Alice's balance AFTER DESTROY: 0
✅ Bob's balance AFTER DESTROY: 1.999931621339593216
✨  Done in 5.14s.
```

Run the test where EIP-7702 and destroy are in the different txs.

```bash
1. Install dependencies:
    yarn install
2. Start Anvil with Odyssey flag:
    anvil --odyssey
3. Run the test script:
    yarn test-diff-tx
```

The result would be something like this:

```bash
$ yarn test-diff-tx
yarn run v1.22.22
warning package.json: No license field
$ tsx script/SelfDestructInDiffTx.ts
=== Testing EIP-7702 Self-Destruct Behavior (In Different Txs) ===

Checking if Anvil is running...
✅ Connected to Anvil
✅ Alice's code BEFORE DESTROY: 0x
✅ Alice's balance BEFORE DESTROY: 1
✅ Bob's balance BEFORE DESTROY: 1

Deploying SimpleDelegation contract...
✅ SimpleDelegation deployed at address: 0x5fc8d32690cc91d4c39d9d3abcbd16989f875707

Signing authorization message for Alice...

1. Bob send a EIP-7702 transaction to attach code to Alice...

2. Bob send a transaction to Alice.destroy() (a normal tx)...

Observation of code and balance of Alice and Bob...
✅ Alice's code AFTER DESTROY: 0xef01005fc8d32690cc91d4c39d9d3abcbd16989f875707
✅ Alice's balance AFTER DESTROY: 0
✅ Bob's balance AFTER DESTROY: 1.99991353275149296
✨  Done in 4.83s.
```
