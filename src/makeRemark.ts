// Make a remark on chain. This is a no-op and only includes a string in the transaction. Good for
// testing as the transaction fee is quite low (if your message is not too verbose).
import { constructRemarkTx } from './payloadConstructors/systemRemark';
import {
  createAndSubmitTransaction,
  promptSignature,
  RemarkInputs,
  TxConstruction,
} from './util/util';

const inputs: RemarkInputs = {
	senderAddress: '',
	remark: 'hello',
  tip: 0,
  eraPeriod: 128,
  sidecarHost: 'http://127.0.0.1:8080/',
};

async function main(): Promise<void> {
  // Construct the unsigned transaction.
  const construction: TxConstruction = await constructRemarkTx(inputs);

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
