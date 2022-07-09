/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { readFileSync } from 'fs';

import { doBalancesTransfer } from './payloadConstructors/balancesTransfer';
import { doProxyAddProxy } from './payloadConstructors/proxyAddProxy';
import { doProxyRemoveProxy } from './payloadConstructors/proxyRemoveProxy';
import { doStakingBond } from './payloadConstructors/stakingBond';
import { doStakingBondExtra } from './payloadConstructors/stakingBondExtra';
import { doStakingSetController } from './payloadConstructors/stakingSetController';
import { doSystemRemark } from './payloadConstructors/systemRemark';
import {
	AddProxyInputs,
	BaseUserInputs,
	BondExtraInputs,
	BondInputs,
	RemarkInputs,
	RemoveProxyInputs,
	SetControllerInputs,
	TransferInputs,
} from './util/inputTypes';

interface Call {
	pallet: string;
	method: string;
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	args: any;
}

interface JsonTransactionDetails {
	baseInputs: BaseUserInputs;
	transactions: Call[];
}

async function main(): Promise<void> {
	const transactionDetails = JSON.parse(
		readFileSync('transaction.json').toString(),
	) as JsonTransactionDetails;

	// The user-provided JSON should have two fields:
	//   1. `baseInputs`: All the common stuff like network, era, etc.
	//   2. `transactions`: An array of `Call`s to construct and broadcast.
	const baseInputs = transactionDetails.baseInputs;
	const transactions = transactionDetails.transactions;

	for (const transaction of transactions) {
		const pallet = transaction.pallet;
		const method = transaction.method;

		switch (pallet) {
			case 'balances': {
				if (method == 'transfer') {
					const inputs: TransferInputs = {
						recipientAddress: { id: transaction.args.recipientAddress.id },
						transferValue: transaction.args.value,
						...baseInputs,
					};
					await doBalancesTransfer(inputs);
				}
				break;
			}

			case 'proxy': {
				if (method == 'addProxy') {
					const inputs: AddProxyInputs = {
						delegate: transaction.args.delegate,
						proxyType: transaction.args.proxyType,
						delay: transaction.args.delay,
						...baseInputs,
					};
					await doProxyAddProxy(inputs);
				} else if (method == 'removeProxy') {
					const inputs: RemoveProxyInputs = {
						delegate: transaction.args.delegate,
						proxyType: transaction.args.proxyType,
						delay: transaction.args.delay,
						...baseInputs,
					};
					await doProxyRemoveProxy(inputs);
				}
				break;
			}

			case 'staking': {
				if (method == 'bond') {
					const inputs: BondInputs = {
						controller: transaction.args.controller,
						value: transaction.args.value,
						payee: transaction.args.payee,
						...baseInputs,
					};
					await doStakingBond(inputs);
				} else if (method == 'bondExtra') {
					const inputs: BondExtraInputs = {
						maxAdditional: transaction.args.maxAdditional,
						...baseInputs,
					};
					await doStakingBondExtra(inputs);
				} else if (method == 'setController') {
					const inputs: SetControllerInputs = {
						controller: transaction.args.controller,
						...baseInputs,
					};
					await doStakingSetController(inputs);
				}
				break;
			}

			case 'system': {
				if (method == 'remark') {
					const inputs: RemarkInputs = {
						remark: transaction.args.remark,
						...baseInputs,
					};
					await doSystemRemark(inputs);
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
