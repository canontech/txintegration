// Bond some tokens.
import { decode } from '@substrate/txwrapper-polkadot';
import { constructAddProxyTransaction } from './payloadConstructors/proxyAddProxy';
import {
  AddProxyInputs,
  createAndSubmitTransaction,
  promptSignature,
  TxConstruction,
} from './util/util';
import { DecodedUnsignedTx } from '@substrate/txwrapper-polkadot/lib/index';

const inputs: AddProxyInputs = {
	senderAddress: '',
	delegate: '',
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
			`\n  Delay: ${decoded.method.args.delay}` +
      `\n  Tip: ${decoded.tip}` +
      `\n  Era Period: ${decoded.eraPeriod}`,
  );
}

async function main(): Promise<void> {
  // Construct the unsigned transaction.
  const construction: TxConstruction = await constructAddProxyTransaction(inputs);

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
