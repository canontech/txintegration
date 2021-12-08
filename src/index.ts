import { readFileSync } from 'fs';
import { BaseUserInputs, TransferInputs } from './util/util';
import { doBalancesTransfer } from './payloadConstructors/balancesTransfer'

interface Call {
	pallet: string;
	method: string;
	args: any;
}

async function main(): Promise<void> {

	const transactionDetails = JSON.parse(readFileSync('transaction.json').toString());

	// The user-provided JSON should have two fields:
	//   1. `baseInputs`: All the common stuff like network, era, etc.
	//   2. `transactions`: An array of `Call`s to construct and broadcast.
	const baseInputs: BaseUserInputs = transactionDetails.baseInputs;
	const transactions: [Call] = transactionDetails.transactions;

	for (const transaction of transactions){
		const pallet = transaction.pallet;
		const method = transaction.method;

		switch (pallet) {
			case 'balances': {
				if (method == 'transfer'){
					const inputs: TransferInputs = {
						recipientAddress: { id: transaction.args.recipientAddress.id },
						transferValue: transaction.args.balances.value,
						...baseInputs
					}
					await doBalancesTransfer(inputs);
				}
				break;
			}
		}
	}
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
