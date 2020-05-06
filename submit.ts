// Submit a signed tx using sidecar.
import {
  createSignedTx,
  getRegistry,
	UnsignedTransaction,
} from '@substrate/txwrapper';
import { RegistryInfo } from './util';

const unsigned: UnsignedTransaction;
const signature = '0x00';
const sidecarHost = 'https://cb-runtime-wk8yx7pds0ag.paritytech.net/';
const registryInputs: RegistryInfo = {
	chainName: 'Polkadot',
	specName: 'polkadot',
	specVersion: 1007,
}

async function sidecarPost(url: string, tx: string): Promise<any> {
  return fetch(url, {
    body: JSON.stringify({
      data: `{"tx": "${tx}"}`
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
    .then((response) => response.json())
    .then(({ error, result }) => {
      if (error) {
        throw new Error(error.message);
      }

      return result;
    });
}

async function main(): Promise<void> {
	const registry = getRegistry(
		'Polkadot', // TODO make work with input
		'polkadot',
		registryInputs.specVersion
	);
	const encodedTx = createSignedTx(unsigned, signature, { registry });
	const submission = await sidecarPost(sidecarHost, encodedTx);
	console.log(submission);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
