//
import { getTxHash } from '@substrate/txwrapper';
import { submitTransaction } from './util';

const tx = '';
const sidecarHost = 'http://127.0.0.1:8080';

async function main(): Promise<void> {

  // Log the expected hash.
  const expectedTxHash = getTxHash(tx);
  console.log(`\nExpected Tx Hash: ${expectedTxHash}`);

  // Submit the transaction. Should return the actual hash if accepted by the node.
  const submission = await submitTransaction(sidecarHost, tx);
  console.log(`\nNode Response: ${submission}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
