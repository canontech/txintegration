//
import { Keyring } from '@polkadot/api';
import { createSignedTx, KeyringPair } from '@substrate/txwrapper';
import { constructTransaction } from './construction';
import { submitTransaction } from './submit';
import { UserInputs, TxConstruction, signWith, DECIMALS } from './util';
import { signingKey, curve } from './key';

const inputs: UserInputs = {
	senderAddress: '16ucAqksrCNxBUbVtzGWNju9KRCBkmyAtxoLsHUtaNUjBxe', // Test 1
	recipientAddress: '14inmGQGBE1ptjTcFaDBjewnGKfNanGEYKv1szbguZ1xsk9n', // Test 2
	transferValue: 10 * DECIMALS,
	tip: 0,
	validityPeriod: 600,
	chainName: 'Polkadot',
	specName: 'polkadot',
	sidecarHost: 'http://127.0.0.1:8080/'
}

function createKeyring(uri: string): KeyringPair {
	// Create a new keyring
	const keyring = new Keyring();
	const signingPair = keyring.addFromUri(
		uri,
		{ name: 'Alice' },
		curve
	);
	return signingPair;
}

async function main(): Promise<void> {
	// Construct a transaction.
	const construction: TxConstruction = await constructTransaction(inputs);
	const registry = construction.registry;

	// Wait for the signature.
	const keyPair = createKeyring(signingKey);
	const signature = signWith(
		registry,
		keyPair,
		construction.payload
	);

	// Construct a signed transaction.
	const tx = createSignedTx(construction.unsigned, signature, { registry });

	// Submit the transaction.
	const submission = await submitTransaction(inputs.sidecarHost, tx);
	console.log(`\nNode Response: ${submission}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
