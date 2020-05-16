//
import { createSignedTx, getTxHash, decode } from '@substrate/txwrapper';
import { constructTransaction } from './construction';
import { submitTransaction } from './submit';
import { UserInputs, TxConstruction, DECIMALS } from './util';
import * as readline from 'readline';
import { DecodedUnsignedTx } from '@substrate/txwrapper/lib/decode/decodeUnsignedTx';

const inputs: UserInputs = {
  senderAddress: '16ucAqksrCNxBUbVtzGWNju9KRCBkmyAtxoLsHUtaNUjBxe', // Test 1
  recipientAddress: '14inmGQGBE1ptjTcFaDBjewnGKfNanGEYKv1szbguZ1xsk9n', // Test 2
  transferValue: 10 * DECIMALS,
  tip: 0,
  eraPeriod: 64,
  chainName: 'Polkadot',
  specName: 'polkadot',
  sidecarHost: 'http://127.0.0.1:8080/',
};

function promptSignature(): Promise<string> {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('\nSignature: ', (answer) => {
      resolve(answer);
      rl.close();
    });
  });
}

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
  // Construct a transaction.
  const construction: TxConstruction = await constructTransaction(inputs);
  const registry = construction.registry;

  // Verify transaction details.
  const decodedUnsigned = decode(construction.unsigned, {
    metadataRpc: construction.metadata,
    registry: registry,
  });
  logUnsignedInfo(decodedUnsigned);

  // Log the signing payload to sign offline.
  console.log(`\nSigning Payload: ${construction.payload}`);

  // Wait for the signature.
  const signature = await promptSignature();

  // Construct a signed transaction.
  const tx = createSignedTx(construction.unsigned, signature, {
    metadataRpc: construction.metadata,
    registry: registry,
  });
  console.log(`\nEncoded Transaction: ${tx}`);

  // Log the expected hash.
  const expectedTxHash = getTxHash(tx);
  console.log(`\nExpected Tx Hash: ${expectedTxHash}`);

  // Submit the transaction.
  const submission = await submitTransaction(inputs.sidecarHost, tx);
  console.log(`\nNode Response: ${submission}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
