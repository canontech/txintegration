//
import { createSignedTx, getTxHash } from '@substrate/txwrapper';
import { constructTransaction } from './construction';
import { UserInputs, TxConstruction } from './util';
import * as readline from 'readline';

const inputs: UserInputs = {
	senderAddress: '15wAmQvSSiAK6Z53MT2cQVHXC8Z2et9GojXeVKnGZdRpwPvp',
	recipientAddress: '13iSQm7iyDjoTo3HndhCzpQztAxkNpB1SyRkEuucmAShcApQ',
	transferValue: 1,
	tip: 0,
	validityPeriod: 240,
	sidecarHost: 'https://cb-runtime-wk8yx7pds0ag.paritytech.net/'
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

async function main(): Promise<void> {
	const construction: TxConstruction = await constructTransaction(inputs);
	const registry = construction.registry;
	console.log(`\nSigning Payload: ${construction.payload}`);

	const signature = await promptSignature();

	const tx = createSignedTx(construction.unsigned, signature, { registry });
	console.log(`\nEncoded Transaction: ${tx}`);

	const exptectedTxHash = getTxHash(tx);
	console.log(`\nExpected Tx Hash: ${exptectedTxHash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
