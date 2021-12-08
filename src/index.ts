import { readFileSync } from 'fs';
import { BaseUserInputs, TransferInputs } from './util/util';
import { doBalancesTransfer } from './payloadConstructors/balancesTransfer'

interface Call {
	pallet: string;
	method: string;
	args: any;
}

async function main(): Promise<void> {

	const transactionDetails = JSON.parse(readFileSync('transaction.json').toString())

	const baseInputs: BaseUserInputs = transactionDetails.baseInputs;
	const transactions: [Call] = transactionDetails.transactions;

	for (const transaction in transactions){
		const pallet = transaction.pallet;
		const method = transaction.method;

		switch (pallet) {
			case 'balances': {
				if (method == 'transfer'){
					const inputs: TransferInputs = {
						recipientAddress: { id: transactionDetails.balances.recipientAddress.id },
						transferValue: transactionDetails.balances.value,
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
