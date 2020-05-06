//
import { constructTransaction } from './construction';
import { UserInputs, TxConstruction } from './util';

const inputs: UserInputs = {
	senderAddress: '15wAmQvSSiAK6Z53MT2cQVHXC8Z2et9GojXeVKnGZdRpwPvp',
	recipientAddress: '13iSQm7iyDjoTo3HndhCzpQztAxkNpB1SyRkEuucmAShcApQ',
	transferValue: 1,
	tip: 0,
	validityPeriod: 240,
	sidecarHost: 'https://cb-runtime-wk8yx7pds0ag.paritytech.net/'
}

async function main(): Promise<void> {
	const construction: TxConstruction = constructTransaction(inputs);
	console.log(construction.payload);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
