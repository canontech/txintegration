// Useful functions and types.
import { TypeRegistry } from '@polkadot/types';
import { Keyring } from '@polkadot/api';
import { TRANSACTION_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';
import { KeyringPair, UnsignedTransaction } from '@substrate/txwrapper';
import axios from 'axios';

export interface UserInputs {
  // Address sending the transaction.
  senderAddress: string;
  // Address receiving the transfer.
  recipientAddress: string;
  // Number of tokens to transfer.
  transferValue: number;
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

export interface AttestInputs {
  senderAddress: string;
  agreement: Agreement;
  tip: number;
  eraPeriod: number;
  chainName: ChainName;
  specName: SpecName;
  sidecarHost: string;
}

export interface ClaimInputs {
  polkadotAddress: string;
  ethereumAddress: string;
  tip: number;
  eraPeriod: number;
  chainName: ChainName;
  specName: SpecName;
  sidecarHost: string;
}

export interface BondInputs {
  senderAddress: string;
  controller: string;
  value: number;
  payee: Payee;
  tip: number;
  eraPeriod: number;
  chainName: ChainName;
  specName: SpecName;
  sidecarHost: string;
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

export function createKeyring(uri: string, curve: Curve): KeyringPair {
  const keyring = new Keyring();
  // const signingPair = keyring.addFromUri(uri, { name: 'Alice' }, curve);
  const signingPair = keyring.addFromMnemonic('print slim hand lamp security hollow payment lecture jealous edge movie unique', { name: 'Alice' }, 'sr25519')
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
  // const response = await fetch(url);
  // if (!response.ok) {
  // 	throw new Error(response.statusText);
  // }
  // return response.json();
  return axios.get(url).then(({ data }) => {
    return data;
  });
}
