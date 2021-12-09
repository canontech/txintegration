// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { construct, decode, methods } from '@substrate/txwrapper-polkadot';
import { DecodedUnsignedTx } from '@substrate/txwrapper-polkadot/lib/index';
import {
  createAndSubmitTransaction,
  prepareBaseTxInfo,
  promptSignature,
  RemoveProxyInputs,
} from '../util/util';

function logUnsignedInfo(decoded: DecodedUnsignedTx) {
  console.log(
    `\nTransaction Details:` +
      `\n  Sender: ${decoded.address}` +
      `\n  Proxy:  ${decoded.method.args.delegate}` +
			`\n  Type: ${decoded.method.args.proxyType}` +
      `\n  Tip: ${decoded.tip}` +
      `\n  Era Period: ${decoded.eraPeriod}`,
  );
}

export async function doProxyRemoveProxy(userInputs: RemoveProxyInputs): Promise<void> {
  const { baseTxInfo, optionsWithMeta } = await prepareBaseTxInfo(
    userInputs,
    { check: false, amount: 0 }
  );

  const unsigned = methods.proxy.removeProxy(
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

  // Wait for the signature.
  const signature = await promptSignature();

  // Construct a signed transaction and broadcast it.
  await createAndSubmitTransaction(
    {
      unsigned: unsigned,
      registry: optionsWithMeta.registry,
      metadata: optionsWithMeta.metadataRpc,
    },
    signature,
    userInputs.sidecarHost
  );
}
