// Sign a signing payload. Must be usable offline.
//
// This is the only part of this repo that imports Polkadot JS functions directly. TxWrapper is
// meant to provide tools to create signing payloads. You can sign the payload however you like.
import { cryptoWaitReady } from '@polkadot/util-crypto';
import {
  deriveAddress,
  getRegistry,
  POLKADOT_SS58_FORMAT,
} from '@substrate/txwrapper';
import { RegistryInfo, signWith, createKeyring } from './util';
import * as readline from 'readline';
// Import a secret key URI from `key.ts`, which should be a string. Obviously you will need to
// create your own.
import { signingKey, curve } from './key';

const senderAddress = '15vmRt8TVx6tdy5Qmms4K6eWKqfXF1FNsaYJtQ2pGxex7sU7';
const registryInputs: RegistryInfo = {
  chainName: 'Polkadot',
  specName: 'polkadot',
  specVersion: 0,
};

function promptPayload(): Promise<string> {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('\nPayload: ', (answer) => {
      resolve(answer);
      rl.close();
    });
  });
}

async function main(): Promise<void> {
  // Wait for the promise to resolve async WASM
  await cryptoWaitReady();

  const signingPair = createKeyring(signingKey, curve);
  const signingAddress = deriveAddress(signingPair.publicKey, POLKADOT_SS58_FORMAT);

  const registry = getRegistry(
    registryInputs.chainName,
    registryInputs.specName,
    registryInputs.specVersion,
  );

  if (senderAddress != signingAddress) {
    console.log(
      `Sending and signing key mismatch!\n` +
      `  Keypair Address:     ${signingAddress}\n` +
      `  Transaction Address: ${senderAddress}`,
    );
    process.exit(1);
  }

  const signingPayload = await promptPayload();

  const signature = signWith(signingPair, signingPayload);
  console.log(`\nSignature: ${signature}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
