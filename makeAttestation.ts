//
import { createSignedTx, getTxHash, decode } from '@substrate/txwrapper';
import { constructAttestation } from './attest';
import { submitTransaction } from './submit';
import { AttestInputs, TxConstruction } from './util';
import * as readline from 'readline';
import { DecodedUnsignedTx } from '@substrate/txwrapper/lib/decode/decodeUnsignedTx';

const inputs: AttestInputs = {
  senderAddress: '14FtbmoVqnwG6kdC89o9Tab73JC6QKbq49WADC41zLc9Di5a', // Test 1
  agreement: 'Regular',
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
    `\n  Tip:    ${decoded.tip}` +
    `\n  Era Period: ${decoded.eraPeriod}`,
  );
}

async function main(): Promise<void> {
  // Construct a transaction.
  const construction: TxConstruction = await constructAttestation(inputs);
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
    registry,
  });
  console.log(`\nEncoded Transaction: ${tx}`);

  // Log the expected hash.
  const expectedTxHash = getTxHash(tx);
  console.log(`\nExpected Tx Hash: ${expectedTxHash}`);

  // Submit the transaction.
  // const submission = await submitTransaction(inputs.sidecarHost, tx);
  // console.log(`\nNode Response: ${submission}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
