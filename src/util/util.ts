// Useful functions and types.
import { TypeRegistry } from '@polkadot/types';
import { Keyring } from '@polkadot/api';
import { EXTRINSIC_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';
import { construct, getRegistry, KeyringPair, UnsignedTransaction } from '@substrate/txwrapper-polkadot';
import * as readline from 'readline';
import axios from 'axios';

/* Useful types */

type ChainName = 'Polkadot' | 'Polkadot CC1' | 'Kusama' | 'Westend';
type SpecName = 'polkadot' | 'kusama' | 'westend';
type Payee = 'Staked' | 'Stash' | 'Controller';
type Curve = 'sr25519' | 'ed25519' | 'ecdsa';

/* User Interfaces */

export interface BaseUserInputs {
  // Address sending the transaction.
  senderAddress: string;
  // Tip for block producer.
  tip: number;
  // Number of blocks for which this transaction is valid.
  eraPeriod: number;
  // Host that is running sidecar.
  sidecarHost: string;
  // Override the chain's nonce.
  nonce?: number;
}

export interface TransferInputs extends BaseUserInputs {
  // Address receiving the transfer.
  recipientAddress: { id: string };
  // Number of tokens to transfer.
  transferValue: number;
}

export interface BondInputs extends BaseUserInputs {
  // The account that will be the staking Controller.
  controller: string;
  // The number of tokens to stake.
  value: number;
  // Rewards destination. Can be 'Staked', 'Stash', or 'Controller'.
  payee: Payee;
}

export interface BondExtraInputs extends BaseUserInputs {
  // The number of tokens to stake.
  maxAdditional: number;
}

export interface SetControllerInputs extends BaseUserInputs {
  // The SS-58 encoded controller address.
  controller: string;
}

export interface RemarkInputs extends BaseUserInputs {
  // The remark to put on chain.
  remark: string;
}

export interface AddProxyInputs extends BaseUserInputs {
  // The account to set as proxy.
  delegate: string;
  // The permissions for this proxy account.
  proxyType: string;
  // The number of blocks delay for this proxy.
  delay: number | string;
}

export interface RemoveProxyInputs extends BaseUserInputs {
  // The account to set as proxy.
  delegate: string;
  // The permissions for this proxy account.
  proxyType: string;
  // The number of blocks delay for this proxy.
  delay: number | string;
}

/* Interfaces for Sidecar responses */

// Information to return from unsigned transaction construction. Needed for the signing environment
// and for decoding.
export interface TxConstruction {
  unsigned: UnsignedTransaction;
  payload: string;
  registry: TypeRegistry;
  metadata: string;
}

// The type registry is somewhat mysterious to me. We just need this a lot.
export interface RegistryInfo {
  chainName: ChainName;
  specName: SpecName;
  specVersion: number;
}

// Information about the chain that we need to construct a transaction.
interface ChainData {
  blockNumber: string;
  blockHash: string;
  genesisHash: string;
  chainName: ChainName;
  specName: SpecName;
	specVersion: number;
	transactionVersion: number;
  metadataRpc: string;
}

// Information about the sender's address.
interface AddressData {
  freeBalance: number;
  spendableBalance: number;
  nonce: number;
}

// Response from `/tx/artifacts` endpoint on sidecar. Used to create `ChainData`.
interface ArtifactsResponse {
  // Block for checkpoint
  at: {
    height: string;
    hash: string;
  };
  // Chain data
  genesisHash: string;
  chainName: ChainName;
  specName: SpecName;
	specVersion: string;
	txVersion: string;
  metadata: string;
}

// Response from `/balance` endpoint on sidecar.
interface AddressResponse {
  // Data at block
  at: {
    height: string;
    hash: string;
  };
  // Address data
  nonce: string;
  free: string;
  reserved: string;
  miscFrozen: string;
  feeFrozen: string;
  locks: [];
}

/* Util */

export function getChainDecimals(chain: string): number {
  let decimals: number;
  if (chain == 'polkadot') {
    decimals = 10_000_000_000;
  }
  else if (chain == 'kusama') {
    decimals = 1_000_000_000_000;
  }
  return decimals
}

/* Construction */

interface BaseTxInfo {
  address: string;
  blockHash: string;
  blockNumber: number;
  eraPeriod: number;
  genesisHash: string;
  metadataRpc: string;
  nonce: number;
  specVersion: number;
  transactionVersion: number;
  tip: number;
}

interface OptionsWithMeta {
  metadataRpc: string;
  registry: TypeRegistry;
}

interface BaseTxInfoWithMeta {
  baseTxInfo: BaseTxInfo;
  optionsWithMeta: OptionsWithMeta;
}

interface BalanceCheck {
  check: boolean;
  amount: number;
}

export async function prepareBaseTxInfo(
  userInputs: any,
  checkBalance: BalanceCheck
): Promise<BaseTxInfoWithMeta> {
  const chainData = await getChainData(userInputs.sidecarHost);
  const { specName, chainName, specVersion, metadataRpc } = chainData;
  const senderData = await getSenderData(userInputs.sidecarHost, userInputs.senderAddress);

	logChainData(chainData);

  if (checkBalance.check) {
    const decimals = getChainDecimals(specName);
    checkAvailableBalance(senderData.spendableBalance, checkBalance.amount, decimals);
  }

  const registry = getRegistry({ specName, chainName, specVersion, metadataRpc });

  const baseTxInfo = {
      address: userInputs.senderAddress,
      blockHash: chainData.blockHash,
      blockNumber: registry.createType('BlockNumber', chainData.blockNumber).toBn().toNumber(),
      eraPeriod: userInputs.eraPeriod,
      genesisHash: chainData.genesisHash,
      metadataRpc: chainData.metadataRpc,
      nonce: userInputs.nonce || senderData.nonce,
			specVersion: chainData.specVersion,
			transactionVersion: chainData.transactionVersion,
      tip: userInputs.tip,
    };
  
    const optionsWithMeta = {
      metadataRpc: chainData.metadataRpc,
      registry,
    };

    return { baseTxInfo, optionsWithMeta }
}

function checkAvailableBalance(balance: number, amount: number, decimals: number) {
  if (balance < amount) {
    console.log(
      `Error: Sender only has ${balance / decimals} spendable tokens. ` +
        `Cannot transact with ${amount / decimals} tokens.`,
    );
    process.exit(1);
  }
}

/* Sidecar interaction */

// Get information about the chain.
async function getChainData(sidecarHost: string): Promise<ChainData> {
  const endpoint = `${sidecarHost}transaction/material`;
  const artifacts: ArtifactsResponse = await sidecarGet(endpoint);
  return {
    blockNumber: artifacts.at.height,
    blockHash: artifacts.at.hash,
    genesisHash: artifacts.genesisHash,
    chainName: artifacts.chainName,
    specName: artifacts.specName,
		specVersion: parseInt(artifacts.specVersion),
		transactionVersion: parseInt(artifacts.txVersion),
    metadataRpc: artifacts.metadata,
  };
}

export function logChainData(chainData: ChainData) {
  console.log(`\nChain Name: ${chainData.chainName}`);
  console.log(`Spec Name:  ${chainData.specName}`);
	console.log(`Network Version: ${chainData.specVersion}`);
	console.log(`Transaction Version: ${chainData.transactionVersion}`);
}

// Get information about the sending address.
export async function getSenderData(sidecarHost: string, address: string): Promise<AddressData> {
  const endpoint = `${sidecarHost}accounts/${address}/balance-info`;
  const addressData: AddressResponse = await sidecarGet(endpoint);
  const spendable =
    parseInt(addressData.free) -
    Math.max(parseInt(addressData.feeFrozen), parseInt(addressData.miscFrozen));
  return {
    freeBalance: parseInt(addressData.free),
    spendableBalance: spendable,
    nonce: parseInt(addressData.nonce),
  };
}

export async function submitTransaction(sidecarHost: string, encodedTx: string): Promise<any> {
  const endpoint = `${sidecarHost}transaction/`;
  const submission = await sidecarPost(endpoint, encodedTx);
  return submission;
}

export async function createAndSubmitTransaction(
  construction: TxConstruction,
  signature: `0x$string`,
  sidecarHost: string,
) {
  // Construct a signed transaction.
  const tx = construct.signedTx(construction.unsigned, signature, {
    metadataRpc: construction.metadata,
    registry: construction.registry,
  });
  console.log(`\nEncoded Transaction: ${tx}`);

  // Log the expected hash.
  const expectedTxHash = construct.txHash(tx);
  console.log(`\nExpected Tx Hash: ${expectedTxHash}`);

  // Submit the transaction. Should return the actual hash if accepted by the node.
  const submission = await submitTransaction(sidecarHost, tx);
  console.log(`\nNode Response: ${submission}`);
}

/* Signing utilities */

// Ask the user to supply a signature and wait for the response.
export function promptSignature(): Promise<any> {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('\nSignature: ', (answer) => {
      resolve(answer);
      rl.close();
    });
  });
}

// Create a new keyring to sign with.
export function createKeyring(uri: string, curve: Curve): KeyringPair {
  const keyring = new Keyring();
  const signingPair = keyring.addFromUri(uri, { name: 'Alice' }, curve);
  return signingPair;
}

// Signing function. Only use this on an OFFLINE signing device.
export function signWith(
  registry: TypeRegistry,
  pair: KeyringPair,
  signingPayload: string,
): string {
  const { signature } = registry
    .createType('ExtrinsicPayload', signingPayload, {
      version: EXTRINSIC_VERSION,
    })
    .sign(pair);

  return signature;
}

/* Basic GET/POST interaction with Sidecar */

// Get information from the sidecar.
export async function sidecarGet(url: string): Promise<any> {
  return axios.get(url).then(({ data }) => {
    return data;
  });
}

// Submit a signed tx using sidecar.
async function sidecarPost(url: string, tx: string): Promise<any> {
  return axios
    .post(
      url,
      { tx },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
    .then(({ data }) => data)
    .then(({ cause, data, error, hash }) => {
      if (cause || error) {
        throw new Error(`${cause}: ${error} (${data})`);
      }

      return hash;
    });
}
