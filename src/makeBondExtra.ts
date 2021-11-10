// Bond some tokens.
import { decode } from '@substrate/txwrapper-polkadot';
import { constructBondExtra } from './payloadConstructors/stakingBondExtra';
import {
  BondExtraInputs,
  createAndSubmitTransaction,
  getChainDecimals,
  promptSignature,
  TxConstruction,
} from './util/util';
import { DecodedUnsignedTx } from '@substrate/txwrapper-polkadot/lib/decode/decodeUnsignedTx';

const inputs: BondExtraInputs = {
	senderAddress: '',
	maxAdditional: 1 * getChainDecimals('kusama'),
  tip: 0,
  eraPeriod: 128,
  sidecarHost: 'http://127.0.0.1:8080/',
};

function logUnsignedInfo(decoded: DecodedUnsignedTx) {
  console.log(
    `\nTransaction Details:` +
      `\n  Sending Account: ${decoded.address}` +
			`\n  Value: ${decoded.method.args.maxAdditional}` +
      `\n  Tip: ${decoded.tip}` +
      `\n  Era Period: ${decoded.eraPeriod}`,
  );
}

async function main(): Promise<void> {
  // Construct the unsigned transaction.
  const construction: TxConstruction = await constructBondExtra(inputs);

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
