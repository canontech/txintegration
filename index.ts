//
import { createSignedTx, getTxHash, decode } from '@substrate/txwrapper';
import { constructTransaction } from './construction';
import { submitTransaction } from './submit';
import { UserInputs, TxConstruction, DECIMALS } from './util';
import * as readline from 'readline';
import { DecodedUnsignedTx } from '@substrate/txwrapper/lib/decode/decodeUnsignedTx';

const inputs: UserInputs = {
	senderAddress: '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5', //Alice
	recipientAddress: '14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3', //Bob
	transferValue: 1 * DECIMALS,
	tip: 0,
	validityPeriod: 240,
	sidecarHost: 'http://127.0.0.1:8080/'
}

function promptSignature(): Promise<string> {
	let rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	return (new Promise((resolve) => {
		rl.question('\nSignature: ', (answer) => {
			resolve(answer);
			rl.close();
		})
	}));
}

function logUnsignedInfo(decoded: DecodedUnsignedTx) {
	console.log(
		`\nTransaction Details:` +
		`\n  Sending Account:   ${decoded.address}` +
		`\n  Receiving Account: ${decoded.method.args.dest}` +
		`\n  Amount: ${decoded.method.args.value}` +
		`\n  Tip:    ${decoded.tip}`
	)
}

async function main(): Promise<void> {
	// Construct a transaction.
	const construction: TxConstruction = await constructTransaction(inputs);
	const registry = construction.registry;

	// Verify transaction details.
	const decodedUnsigned = decode(
		construction.unsigned,
		{ metadata: construction.metadata, registry: registry }
	);
	logUnsignedInfo(decodedUnsigned);

	// Log the signing payload to sign offline.
	console.log(`\nSigning Payload: ${construction.payload}`);

	// Wait for the signature.
	const signature = await promptSignature();

	// Construct a signed transaction.
	const tx = createSignedTx(construction.unsigned, signature, { registry });
	console.log(`\nEncoded Transaction: ${tx}`);

	// Log the expected hash.
	const expectedTxHash = getTxHash(tx);
	console.log(`\nExpected Tx Hash: ${expectedTxHash}`);

	// Submit the transaction.
	const submission = await submitTransaction(inputs.sidecarHost, tx);
	console.log(`\nNode Response: ${submission}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
