import { createWalletClient, http, createPublicClient } from 'viem';
import { foundry } from 'viem/chains';
import abi from '../out/SimpleDelegation.sol/SimpleDelegation.json' assert { type: 'json' };
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { eip7702Actions } from 'viem/experimental';

export const simpleDelegationAbi = abi.abi;
export const simpleDelegationBytecode = abi.bytecode.object;

const DEPLOYER_PK =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as `0x${string}`;

export const setup = async () => {
  const publicClient = createPublicClient({
    chain: foundry,
    transport: http('http://127.0.0.1:8545'),
  });

  const deployerClient = createWalletClient({
    account: privateKeyToAccount(DEPLOYER_PK),
    chain: foundry,
    transport: http('http://127.0.0.1:8545'),
  });

  const aliceClient = createWalletClient({
    account: privateKeyToAccount(generatePrivateKey()),
    chain: foundry,
    transport: http('http://127.0.0.1:8545'),
  }).extend(eip7702Actions());

  const bobClient = createWalletClient({
    account: privateKeyToAccount(generatePrivateKey()),
    chain: foundry,
    transport: http('http://127.0.0.1:8545'),
  });

  const aliceAccount = aliceClient.account;
  const bobAccount = bobClient.account;

  // send ether to aliceAccount:
  await deployerClient.sendTransaction({
    to: aliceAccount.address,
    value: 1n * 10n ** 18n,
  });
  // send ether to bobAccount:
  await deployerClient.sendTransaction({
    to: bobAccount.address,
    value: 1n * 10n ** 18n,
  });

  return {
    publicClient,
    deployerClient,
    aliceClient,
    bobClient,
    aliceAccount,
    bobAccount,
  };
};
