// Useful functions and types.
import { TypeRegistry } from '@polkadot/types';
import { TRANSACTION_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';

import { KeyringPair } from '@substrate/txwrapper';

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
