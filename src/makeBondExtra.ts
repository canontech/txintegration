// Bond some more tokens.
import { constructBondExtra } from './payloadConstructors/stakingBondExtra';
import {
  BondExtraInputs,
  createAndSubmitTransaction,
  getChainDecimals,
  promptSignature,
  TxConstruction,
} from './util/util';

const inputs: BondExtraInputs = {
	senderAddress: '',
	maxAdditional: 1 * getChainDecimals('kusama'),
  tip: 0,
  eraPeriod: 128,
  sidecarHost: 'http://127.0.0.1:8080/',
};

async function main(): Promise<void> {
  // Construct the unsigned transaction.
  const construction: TxConstruction = await constructBondExtra(inputs);

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
