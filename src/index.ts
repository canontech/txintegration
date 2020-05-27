//
import { createSignedTx, getTxHash, decode } from '@substrate/txwrapper';
import { constructTransfer } from './payloadConstructors/balancesTransferKeepAlive';
import {
  promptSignature,
  TransferInputs,
  TxConstruction,
  DECIMALS,
  submitTransaction
} from './util/util';
import { DecodedUnsignedTx } from '@substrate/txwrapper/lib/decode/decodeUnsignedTx';

const inputs: TransferInputs = {
  senderAddress: '12v6hFUh4mKXq3XexwzwtRqXUNi6YLbGpGiumfGZhdvK6ahs', // Test 1
  recipientAddress: '14inmGQGBE1ptjTcFaDBjewnGKfNanGEYKv1szbguZ1xsk9n', // Test 2
  transferValue: 1 * DECIMALS,
  tip: 0,
  eraPeriod: 64,
  chainName: 'Polkadot',
  specName: 'polkadot',
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

  // Construct a signed transaction.
  const tx = createSignedTx(construction.unsigned, signature, {
    metadataRpc: construction.metadata,
    registry: construction.registry,
  });
  console.log(`\nEncoded Transaction: ${tx}`);

  // Log the expected hash.
  const expectedTxHash = getTxHash(tx);
  console.log(`\nExpected Tx Hash: ${expectedTxHash}`);

  // Submit the transaction. Should return the actual hash if accepted by the node.
  const submission = await submitTransaction(inputs.sidecarHost, tx);
  console.log(`\nNode Response: ${submission}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
