// Construct and submit a `balance.transferKeepAlive` transaction.
import { decode } from '@substrate/txwrapper';
import { constructTransfer } from './payloadConstructors/balancesTransferKeepAlive';
import {
  createAndSubmitTransaction,
  getChainDecimals,
  promptSignature,
  TransferInputs,
  TxConstruction,
} from './util/util';
import { DecodedUnsignedTx } from '@substrate/txwrapper/lib/decode/decodeUnsignedTx';

const inputs: TransferInputs = {
  senderAddress: '12v6hFUh4mKXq3XexwzwtRqXUNi6YLbGpGiumfGZhdvK6ahs', // Test 1
  recipientAddress: '14inmGQGBE1ptjTcFaDBjewnGKfNanGEYKv1szbguZ1xsk9n', // Test 2
  transferValue: 1 * getChainDecimals('kusama'),
  tip: 0,
  eraPeriod: 64,
  sidecarHost: 'http://127.0.0.1:8080/',
};

function logUnsignedInfo(decoded: DecodedUnsignedTx) {
  console.log(
    `\nTransaction Details:` +
      `\n  Sending Account:   ${decoded.address}` +
      `\n  Receiving Account: ${decoded.method.args.dest}` +
      `\n  Amount: ${decoded.method.args.value}` +
      `\n  Tip:    ${decoded.tip}` +
      `\n  Era Period: ${decoded.eraPeriod}`,
  );
}

async function main(): Promise<void> {
  // Construct the unsigned transaction.
  const construction: TxConstruction = await constructTransfer(inputs);

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
