// Sign a signing payload. Must be usable offline.
//
// This is the only part of this repo that imports Polkadot JS functions directly. TxWrapper is
// meant to provide tools to create signing payloads. You can sign the payload however you like.
import { readFileSync } from 'fs';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { deriveAddress, getRegistry } from '@substrate/txwrapper-polkadot';
import { signWith, createKeyring } from './util/util';
import * as readline from 'readline';
// You will need the metadata in this context. Take it from Sidecar's `tx/artifacts` endpoint.
// This file contains some metadata for known runtimes.
import { polkadotMetadata, kusamaMetadata } from './metadata';

type ChainName = 'Polkadot' | 'Polkadot CC1' | 'Kusama' | 'Westend';
type SpecName = 'polkadot' | 'kusama' | 'westend';
type Curve = 'sr25519' | 'ed25519' | 'ecdsa';

interface SigningInfo {
  specName: SpecName;
  chainName: ChainName;
  specVersion: number;
  curve: Curve;
  signingKey: string;
  senderAddress: string;
}

function getSigningInfo(): SigningInfo {
  const signingInfo = JSON.parse(readFileSync('key.json').toString());
  return {
    specName: signingInfo.specName,
    chainName: signingInfo.chainName,
    specVersion: signingInfo.specVersion,
    curve: signingInfo.curve,
    signingKey: signingInfo.signingKey,
    senderAddress: signingInfo.senderAddress,
  }
}

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

  const signingInfo: SigningInfo = getSigningInfo();

  let SS58_FORMAT: number;
  let md;
  switch (signingInfo.specName) {
    case 'kusama': {
      SS58_FORMAT = 2;
      md = kusamaMetadata;
      break;
    }
    case 'polkadot': {
      SS58_FORMAT = 0;
      md = polkadotMetadata
      break;
    }
    case 'westend': {
      SS58_FORMAT = 42;
      console.warn(`TODO: Need metadata for Westend. Likely to get BadProof error.`)
      break;
    }
    default: {
      console.warn(`Unrecognized chain spec! Using dev chain SS58 format of 42.`);
      SS58_FORMAT = 42;
      break;
    }
  }

  const registry = getRegistry({ 
    specName: signingInfo.specName,
    chainName: signingInfo.chainName,
    specVersion: signingInfo.specVersion,
    metadataRpc: md,
  });

  const signingPair = createKeyring(signingInfo.signingKey, signingInfo.curve);
  const signingAddress = deriveAddress(signingPair.publicKey, SS58_FORMAT);

  if (signingInfo.senderAddress != signingAddress) {
    console.log(
      `Sending and signing key mismatch!\n` +
      `  Keypair Address:     ${signingAddress}\n` +
      `  Transaction Address: ${signingInfo.senderAddress}`,
    );
    process.exit(1);
  }

  const signingPayload = await promptPayload();

  const signature = signWith(registry, signingPair, signingPayload);
  console.log(`\nSignature: ${signature}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
