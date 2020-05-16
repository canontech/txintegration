//
import { Keyring } from '@polkadot/api';
import { createSignedTx, KeyringPair } from '@substrate/txwrapper';
import { constructTransaction } from './construction';
import { submitTransaction } from './submit';
import { UserInputs, TxConstruction, signWith, DECIMALS } from './util';
import { signingKey, curve } from './key';
import { cryptoWaitReady } from '@polkadot/util-crypto';

const inputs: UserInputs = {
	senderAddress: '16ucAqksrCNxBUbVtzGWNju9KRCBkmyAtxoLsHUtaNUjBxe', // Test 1
	recipientAddress: '14inmGQGBE1ptjTcFaDBjewnGKfNanGEYKv1szbguZ1xsk9n', // Test 2
	transferValue: 1 * DECIMALS,
	tip: 0,
	eraPeriod: 64,
	chainName: 'Polkadot',
	specName: 'polkadot',
	sidecarHost: 'http://127.0.0.1:8080/',
	nonce: 1
}

const recipients = [
	'14inmGQGBE1ptjTcFaDBjewnGKfNanGEYKv1szbguZ1xsk9n', // Test 2
	'1H5kpTFie7knRsJdGgU2TxTnFGKu1dWaE138NL6JENsPjEt',  // Test 3
	'15x1zAvsJcBAiqSSsazxpEUyE9TsrWKdmPxd897hwYYLvfoW', // Test 4
	'16iGere6SnK5NYP8qhpsPkfPzwMn3sFiLpG3ny64RhSxwaGm'  // Test 5
];

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
	// Wait for the promise to resolve async WASM
	await cryptoWaitReady();
	// Wait for the signature.
	const keyPair = createKeyring(signingKey);

	const limit = 4;
	var txs = [];
	for (var ii=0; ii < limit; ii++){
		inputs.recipientAddress = recipients[ii % recipients.length];

		// Construct a transaction.
		const construction: TxConstruction = await constructTransaction(inputs);
		const registry = construction.registry;

		const signature = signWith(
			registry,
			keyPair,
			construction.payload
		);

		// Construct a signed transaction.
		const tx = createSignedTx(
			construction.unsigned,
			signature, 
			{ metadataRpc: construction.metadata, registry: registry }
		);
		txs.push(tx);
		inputs.nonce += 1;
		if (ii % 10 == 0){
			console.log(`Transactions: ${ii}`);
		}
	}
	
	const startSubmit = Date.now();
	for (var jj=0; jj < txs.length; jj++){
		// Submit the transaction.
		const submission = await submitTransaction(inputs.sidecarHost, txs[jj]);
		console.log(`\nNode Response: ${submission}`);
	}
	const endSubmit = Date.now();
	console.log(`Average Submission Time: ${(endSubmit - startSubmit) / txs.length} ms`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
