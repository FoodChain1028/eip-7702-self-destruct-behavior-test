import { formatEther, zeroAddress } from 'viem';
import { simpleDelegationAbi, simpleDelegationBytecode, setup } from './utils.js';

async function main() {
  console.log('=== Testing EIP-7702 Self-Destruct Behavior (In Different Txs) ===');

  // Step 0: Check if Anvil is running with --odyssey && Setup
  const { publicClient, deployerClient, aliceClient, bobClient, aliceAccount, bobAccount } =
    await setup();

  console.log('\nChecking if Anvil is running...');
  try {
    await publicClient.getChainId();
    console.log('✅ Connected to Anvil');
  } catch (error) {
    console.error('❌ Cannot connect to Anvil. Please run `anvil --odyssey`');
    process.exit(1);
  }

  const initAliceCode = await publicClient.getCode({ address: aliceAccount.address });
  const initAliceBalance = await publicClient.getBalance({ address: aliceAccount.address });
  const initBobBalance = await publicClient.getBalance({ address: bobAccount.address });
  console.log(`✅ Alice's code BEFORE DESTROY: ${initAliceCode || '0x'}`);
  console.log(`✅ Alice's balance BEFORE DESTROY: ${formatEther(initAliceBalance)}`);
  console.log(`✅ Bob's balance BEFORE DESTROY: ${formatEther(initBobBalance)}`);
  /// ======================================================================

  // Step 1: Deploy SimpleDelegation contract
  console.log('\nDeploying SimpleDelegation contract...');

  const hash = await deployerClient.deployContract({
    abi: simpleDelegationAbi,
    bytecode: simpleDelegationBytecode as `0x${string}`,
  });

  // Wait for the transaction to be mined and get the receipt
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress as `0x${string}`;
  console.log(`✅ SimpleDelegation deployed at address: ${contractAddress}`);
  /// ======================================================================

  // Step 2: Sign authorization message for Alice to convert into EIP-7702
  console.log('\nSigning authorization message for Alice...');
  const authorization = await aliceClient.signAuthorization({
    account: aliceAccount,
    contractAddress,
    delegate: true,
  });

  // Uncomment to check the authorized msg
  // console.log(
  //   `\n✅ authorization message signed by Alice: ${JSON.stringify(
  //     authorization,
  //     (key, value) => (typeof value === 'bigint' ? value.toString() : value),
  //     2
  //   )}`
  // );
  /// ======================================================================

  // Step 3: Bob send a EIP-7702 transaction to attach code to Alice
  console.log('\n1. Bob send a EIP-7702 transaction to attach code to Alice...');
  const txHash = await bobClient.sendTransaction({
    to: zeroAddress,
    authorizationList: [authorization],
    value: 0n,
  });
  // Uncomment this to check the tx type:
  // const attachReceipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  // console.log(`\n✅ attach transaction receipt: ${JSON.stringify(attachReceipt, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2)}`);
  /// ======================================================================

  // Step 4: Bob send a transaction to Alice.destroy() (a normal tx)
  console.log('\n2. Bob send a transaction to Alice.destroy() (a normal tx)...');
  const destroyHash = await bobClient.writeContract({
    abi: simpleDelegationAbi,
    address: aliceAccount.address,
    functionName: 'destroy',
  });

  // Uncomment this to check the tx type:
  // const destroyReceipt = await publicClient.waitForTransactionReceipt({ hash: destroyHash });
  // console.log(`✅ destroy transaction receipt: ${JSON.stringify(destroyReceipt, (key, value) => (typeof value === 'bigint' ? value.toString() : value), 2)}`);
  /// ======================================================================

  // Step 5: Observation of code and balance of Alice and Bob
  console.log('\nObservation of code and balance of Alice and Bob...');
  const aliceCode = await publicClient.getCode({ address: aliceAccount.address });
  const aliceBalance = await publicClient.getBalance({ address: aliceAccount.address });
  const bobBalance = await publicClient.getBalance({ address: bobAccount.address });
  const contractBalance = await publicClient.getBalance({ address: contractAddress });

  console.log(`✅ Alice's code AFTER DESTROY: ${aliceCode}`);
  console.log(`✅ Alice's balance AFTER DESTROY: ${formatEther(aliceBalance)}`);
  console.log(`✅ Bob's balance AFTER DESTROY: ${formatEther(bobBalance)}`);
}

main();
