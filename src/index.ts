import { readFileSync } from 'fs';
import { BaseUserInputs } from './util/util';

async function main(): Promise<void> {
	const transactionDetails = JSON.parse(readFileSync('transaction.json').toString())

	const baseInputs: BaseUserInputs = transactionDetails.baseInputs;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
