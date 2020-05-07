// Sign a signing payload. Must be usable offline.
//
// This is the only part of this repo that imports Polkadot JS functions directly. TxWrapper is
// meant to provide tools to create signing payloads. You can sign the payload however you like.
import { Keyring } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import {
  deriveAddress,
  getRegistry,
  POLKADOT_SS58_FORMAT,
	KeyringPair,
} from '@substrate/txwrapper';
import { RegistryInfo, signWith } from './util';
// Import a secret key URI from `key.ts`, which should be a string. Obviously you will need to
// create your own.
import { signingKey } from './key';

const signingPayload = '0x...';
const senderAddress = '15wAmQvSSiAK6Z53MT2cQVHXC8Z2et9GojXeVKnGZdRpwPvp';
const registryInputs: RegistryInfo = {
	chainName: 'Polkadot',
	specName: 'polkadot',
	specVersion: 1007,
}

function createKeyring(uri: string): KeyringPair {
	// Create a new keyring
	const keyring = new Keyring();
	const signingPair = keyring.addFromUri(
		uri,
		{ name: 'Alice' },
		'ed25519' // TODO make input param
	);
	return signingPair;
}

async function main(): Promise<void> {
	// Wait for the promise to resolve async WASM
	await cryptoWaitReady();

	const signingPair = createKeyring(signingKey);
	const signingAddress = deriveAddress(signingPair.publicKey, POLKADOT_SS58_FORMAT);

	const registry = getRegistry(
		'Polkadot', // TODO make work with input
		'polkadot',
		registryInputs.specVersion
	);

	if (senderAddress != signingAddress) {
		console.log(
			`Sending and signing key mismatch!\n`
			+ `  Keypair Address:     ${signingAddress}\n`
			+ `  Transaction Address: ${senderAddress}`
		)
		process.exit(1);
	}

	const signature = signWith(registry, signingPair, signingPayload);
	console.log(`\nSignature: ${signature}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
