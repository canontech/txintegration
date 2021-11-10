// Bond some tokens.
import { decode } from '@substrate/txwrapper-polkadot';
import { constructRemoveProxyTransaction } from './payloadConstructors/proxyRemoveProxy';
import {
  createAndSubmitTransaction,
  promptSignature,
  RemoveProxyInputs,
  TxConstruction,
} from './util/util';
import { DecodedUnsignedTx } from '@substrate/txwrapper-polkadot/lib/decode/decodeUnsignedTx';

const inputs: RemoveProxyInputs = {
	senderAddress: 'DPs2tExwULx8tRc2N7ECrWTzrPhbdVBApLVDiugkusaVH8Q', // Test 1
	delegate: 'EAZbMxUvCqL7kXcUZeG5B6R3tjgmEpWsm53kPejVz2zJGjq',
  proxyType: 'NonTransfer',
  delay: 0,
  tip: 0,
  eraPeriod: 256,
  sidecarHost: 'http://127.0.0.1:8080/',
};

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

async function main(): Promise<void> {
  // Construct the unsigned transaction.
  const construction: TxConstruction = await constructRemoveProxyTransaction(inputs);

  // Verify transaction details.
  const decodedUnsigned = decode(construction.unsigned, {
    metadataRpc: construction.metadata,
    registry: construction.registry,
  });
  logUnsignedInfo(decodedUnsigned);

  // Log the signing payload to sign offline.
  console.log(`\nSigning Payload: ${construction.payload}`);

  // Wait for the signature.
  const signature = await promptSignature();

  // Construct a signed transaction and broadcast it.
  await createAndSubmitTransaction(construction, signature, inputs.sidecarHost);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
