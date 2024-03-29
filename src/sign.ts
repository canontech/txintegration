// Sign a signing payload. Must be usable offline.
//
// This is the only part of this repo that imports Polkadot JS functions directly. TxWrapper is
// meant to provide tools to create signing payloads. You can sign the payload however you like.
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { deriveAddress, getRegistry } from '@substrate/txwrapper-polkadot';
import { readFileSync } from 'fs';

// You will need the metadata in this context. Take it from Sidecar's `tx/artifacts` endpoint.
// This file contains some metadata for known runtimes.
import { kusamaMetadata, polkadotMetadata } from './metadata';
import { createKeyring, promptUser, signWith } from './util/signing';
import { ChainName, Curve, Metadata, SpecName } from './util/types';

interface BaseSigningInfo {
	specName: SpecName | string;
	specVersion: number;
	curve: Curve;
	signingKey: string;
	senderAddress: string;
}

interface JsonSigningInfo extends BaseSigningInfo {
	password: string;
}

interface SigningInfo extends BaseSigningInfo {
	chainName: ChainName;
}

function getSigningInfo(): SigningInfo {
	const signingInfo = JSON.parse(readFileSync('key.json').toString()) as JsonSigningInfo;

	let chainName: ChainName;
	if (signingInfo.specName === 'polkadot') {
		chainName = 'Polkadot';
	} else if (signingInfo.specName === 'kusama') {
		chainName = 'Kusama';
	} else if (signingInfo.specName === 'westend') {
		chainName = 'Westend';
	} else {
		throw Error(
			`Error, registry for ${signingInfo.specName || '(specName not supplied)'} not supported.`,
		);
	}

	let key: string = signingInfo.signingKey;
	if (signingInfo.password != '') {
		key = `${signingInfo.signingKey}///${signingInfo.password}`;
	}

	return {
		specName: signingInfo.specName,
		chainName: chainName,
		specVersion: signingInfo.specVersion,
		curve: signingInfo.curve,
		signingKey: key,
		senderAddress: signingInfo.senderAddress,
	};
}

async function main(): Promise<void> {
	// Wait for the promise to resolve async WASM
	await cryptoWaitReady();

	const signingInfo: SigningInfo = getSigningInfo();

	let SS58_FORMAT: number;
	let md: Metadata;
	switch (signingInfo.specName) {
		case 'kusama': {
			SS58_FORMAT = 2;
			md = kusamaMetadata;
			break;
		}
		case 'polkadot': {
			SS58_FORMAT = 0;
			md = polkadotMetadata;
			break;
		}
		case 'westend': {
			SS58_FORMAT = 42;
			throw Error(`TODO: Need metadata for Westend. Likely to get BadProof error.`);
		}
		default: {
			SS58_FORMAT = 42;
			throw Error(
				`TODO: (Needs Metadata): Unrecognized chain spec! Using dev chain SS58 format of 42.`,
			);
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

	const signingPayload = await promptUser('Payload');

	const signature = signWith(registry, signingPair, signingPayload);
	console.log(`\nSignature: ${signature}\n`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
