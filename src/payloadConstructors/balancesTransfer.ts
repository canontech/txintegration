// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { construct, decode, methods } from '@substrate/txwrapper-polkadot';
import { DecodedUnsignedTx } from '@substrate/txwrapper-polkadot/lib/index';

import { createAndSubmitTransaction, prepareBaseTxInfo } from '../util/construction';
import { TransferInputs } from '../util/inputTypes';

function logUnsignedInfo(decoded: DecodedUnsignedTx) {
	console.log(
		`\nTransaction Details:` +
			`\n  Sending Account:   ${decoded.address}` +
			`\n  Receiving Account: ${JSON.stringify(decoded.method.args.dest, null, 2)}` +
			`\n  Amount: ${decoded.method.args.value as number}` +
			`\n  Tip:    ${decoded.tip || 'No tip included.'}` +
			`\n  Era Period: ${decoded.eraPeriod || 64}`,
	);
}

export async function doBalancesTransfer(userInputs: TransferInputs): Promise<void> {
	const { baseTxInfo, optionsWithMeta } = await prepareBaseTxInfo(userInputs, {
		check: true,
		amount: userInputs.transferValue,
	});

	const unsigned = methods.balances.transferAllowDeath(
		{
			value: userInputs.transferValue,
			dest: { id: userInputs.recipientAddress.id },
		},
		baseTxInfo,
		optionsWithMeta,
	);

	// Verify transaction details.
	const decodedUnsigned = decode(unsigned, {
		metadataRpc: optionsWithMeta.metadataRpc,
		registry: optionsWithMeta.registry,
	});
	logUnsignedInfo(decodedUnsigned);

	// Construct the signing payload from an unsigned transaction.
	const signingPayload: string = construct.signingPayload(unsigned, optionsWithMeta);

	// Log the signing payload to sign offline.
	console.log(`\nSigning Payload: ${signingPayload}`);

	// Construct a signed transaction and broadcast it.
	await createAndSubmitTransaction(
		{
			unsigned: unsigned,
			registry: optionsWithMeta.registry,
			metadata: optionsWithMeta.metadataRpc,
		},
		userInputs.sidecarHost,
	);
}
