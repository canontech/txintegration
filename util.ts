// Useful functions and types.
import { TypeRegistry } from '@polkadot/types';
import { TRANSACTION_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';

import { KeyringPair, UnsignedTransaction } from '@substrate/txwrapper';

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

export const DECIMALS = 1_000_000_000_000;

type ChainName = 'Polkadot' | 'Kusama';
type SpecName = 'polkadot' | 'kusama';

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

// Signing function. Implement this on the OFFLINE signing device.
export function signWith(
  registry: TypeRegistry,
  pair: KeyringPair,
  signingPayload: string
): string {
  const { signature } = registry
    .createType('ExtrinsicPayload', signingPayload, {
      version: TRANSACTION_VERSION,
    })
    .sign(pair);

  return signature;
}

// Get information from the sidecar.
export async function sidecarGet(
	url: string
): Promise<any> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(response.statusText);
	}
	return response.json();
}
