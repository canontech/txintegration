// Useful functions and types.
import { TypeRegistry } from '@polkadot/types';
import { Keyring } from '@polkadot/api';
import { TRANSACTION_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';
import { KeyringPair, UnsignedTransaction } from '@substrate/txwrapper';
import axios from 'axios';

interface BaseUserInputs {
  // Address sending the transaction.
  senderAddress: string;
  // Tip for block producer.
  tip: number;
  // Number of blocks for which this transaction is valid.
  eraPeriod: number;
  // Chain name.
  chainName: ChainName;
  // Chain spec.
  specName: SpecName;
  // Host that is running sidecar.
  sidecarHost: string;
  // Override the chain's nonce.
  nonce?: number;
}

export interface TransferInputs extends BaseUserInputs {
  // Address receiving the transfer.
  recipientAddress: string;
  // Number of tokens to transfer.
  transferValue: number;
}

export interface AttestInputs extends BaseUserInputs {
  agreement: Agreement;
}

export interface ClaimInputs extends BaseUserInputs {
  polkadotAddress: string;
  ethereumAddress: string;
}

export interface BondInputs extends BaseUserInputs {
  controller: string;
  value: number;
  payee: Payee;
}

export const DECIMALS = 1_000_000_000_000;

type ChainName = 'Polkadot' | 'Kusama';
type SpecName = 'polkadot' | 'kusama';
type Agreement = 'Regular' | 'Saft';
type Payee = 'Staked' | 'Stash' | 'Controller';
type Curve = 'sr25519' | 'ed25519' | 'ecdsa';

export interface TxConstruction {
  unsigned: UnsignedTransaction;
  payload: string;
  registry: TypeRegistry;
  metadata: string;
}

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
	specVersion: number;
	transactionVersion: number;
  metadataRpc: string;
}

// Information about the sender's address.
interface AddressData {
  balance: number;
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

// Get information about the chain.
export async function getChainData(sidecarHost: string): Promise<ChainData> {
  const endpoint = `${sidecarHost}tx/artifacts`;
  const artifacts: ArtifactsResponse = await sidecarGet(endpoint);
  return {
    blockNumber: artifacts.at.height,
    blockHash: artifacts.at.hash,
    genesisHash: artifacts.genesisHash,
		specVersion: parseInt(artifacts.specVersion),
		transactionVersion: parseInt(artifacts.txVersion),
    metadataRpc: artifacts.metadata,
  };
}

// Get information about the sending address.
export async function getSenderData(sidecarHost: string, address: string): Promise<AddressData> {
  const endpoint = `${sidecarHost}balance/${address}`;
  const addressData: AddressResponse = await sidecarGet(endpoint);
  const spendable =
    parseInt(addressData.free) -
    Math.max(parseInt(addressData.feeFrozen), parseInt(addressData.miscFrozen));
  return {
    balance: spendable,
    nonce: parseInt(addressData.nonce),
  };
}

export async function submitTransaction(sidecarHost: string, encodedTx: string): Promise<any> {
  const endpoint = `${sidecarHost}tx/`;
  const submission = await sidecarPost(endpoint, encodedTx);
  return submission;
}

export function createKeyring(uri: string, curve: Curve): KeyringPair {
  const keyring = new Keyring();
  const signingPair = keyring.addFromUri(uri, { name: 'Alice' }, curve);
  return signingPair;
}

// Signing function. Implement this on the OFFLINE signing device.
export function signWith(
  registry: TypeRegistry,
  pair: KeyringPair,
  signingPayload: string,
): string {
  const { signature } = registry
    .createType('ExtrinsicPayload', signingPayload, {
      version: TRANSACTION_VERSION,
    })
    .sign(pair);

  return signature;
}

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
