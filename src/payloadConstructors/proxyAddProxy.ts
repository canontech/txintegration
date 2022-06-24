// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { construct, decode, methods } from '@substrate/txwrapper-polkadot';
import { DecodedUnsignedTx } from '@substrate/txwrapper-polkadot/lib/index';

import { createAndSubmitTransaction, prepareBaseTxInfo } from '../util/construction';
import { AddProxyInputs } from '../util/inputTypes';

function logUnsignedInfo(decoded: DecodedUnsignedTx) {
	console.log(
		`\nTransaction Details:` +
			`\n  Sender: ${decoded.address}` +
			`\n  Proxy:  ${decoded.method.args.delegate as string}` +
			`\n  Type: ${decoded.method.args.proxyType as string}` +
			`\n  Delay: ${decoded.method.args.delay as string | number}` +
			`\n  Tip: ${decoded.tip || 'No tip included.'}` +
			`\n  Era Period: ${decoded.eraPeriod || 64}`,
	);
}

export async function doProxyAddProxy(userInputs: AddProxyInputs): Promise<void> {
	const { baseTxInfo, optionsWithMeta } = await prepareBaseTxInfo(userInputs, {
		check: false,
		amount: 0,
	});

	const unsigned = methods.proxy.addProxy(
		{
			delegate: userInputs.delegate,
			proxyType: userInputs.proxyType,
			delay: userInputs.delay,
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
