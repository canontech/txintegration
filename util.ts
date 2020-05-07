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
  validityPeriod: number;
  // Host that is running sidecar.
  sidecarHost: string;
}

export const DECIMALS = 1_000_000_000_000;

export interface TxConstruction {
  unsigned: UnsignedTransaction;
  payload: string;
  registry: TypeRegistry;
  metadata: string;
}

export interface RegistryInfo {
	chainName: string;
	specName: string;
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
