import { Keyring } from '@polkadot/api';
import { TypeRegistry } from '@polkadot/types';
import { KeyringPair } from '@substrate/txwrapper-polkadot';
import { EXTRINSIC_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';
import { Curve } from './types';
import * as readline from 'readline';

/* Signing utilities */

// Ask the user to supply something and wait for the response.
export function promptUser(prompt: string): Promise<string> {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`\n${prompt}: `, (answer) => {
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
