// Remove a proxy.
import { constructRemoveProxyTransaction } from './payloadConstructors/proxyRemoveProxy';
import {
  createAndSubmitTransaction,
  promptSignature,
  RemoveProxyInputs,
  TxConstruction,
} from './util/util';

const inputs: RemoveProxyInputs = {
	senderAddress: '',
	delegate: '',
  proxyType: 'NonTransfer',
  delay: 0,
  tip: 0,
  eraPeriod: 256,
  sidecarHost: 'http://127.0.0.1:8080/',
};

async function main(): Promise<void> {
  // Construct the unsigned transaction.
  const construction: TxConstruction = await constructRemoveProxyTransaction(inputs);

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
