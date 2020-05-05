// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import {
  createSigningPayload,
  getRegistry,
  methods,
} from '@substrate/txwrapper';

// User Inputs
const senderAddress = '15wAmQvSSiAK6Z53MT2cQVHXC8Z2et9GojXeVKnGZdRpwPvp';
const recipientAddress = '13iSQm7iyDjoTo3HndhCzpQztAxkNpB1SyRkEuucmAShcApQ';
const transferValue = 1_000_000_000_000;
const tip = 0;
const validityPeriod = 240;
const sidecarHost = 'https://cb-runtime-wk8yx7pds0ag.paritytech.net/';

const DECIMALS = 1_000_000_000_000;

// Information about the chain that we need to construct a transaction.
interface ChainData {
	blockNumber: string;
	blockHash: string;
	genesisHash: string;
	specVersion: number;
	metadataRpc: string;
}

// Information about the sender's address.
interface AddressData {
	balance: number;
	nonce: number;
}

// Response from `/tx/artifacts` endpoint on sidecar. Used to create `ChainData`.
interface ArtifactsResponse {
	// Block for checkpoint
	at: {
		height: string;
		hash: string;
	};
	// Chain data
	genesisHash: string;
	specVersion: string;
	metadata: string;
}

// Response from `/balance` endpoint on sidecar.
interface AddressResponse {
	// Data at block
	at: {
		height: string;
		hash: string;
	};
	// Address data
	nonce: string;
	free: string;
	reserved: string;
	miscFrozen: string;
	feeFrozen: string;
	locks: [];
}

// Get information from the sidecar.
async function sidecarGet(
	url: string
): Promise<any> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(response.statusText);
	}
	return response.json();
}

// Get information about the chain.
async function getChainData(sidecarHost: string): Promise<ChainData> {
	const endpoint = `${sidecarHost}tx/artifacts`;
	const artifacts: ArtifactsResponse = await sidecarGet(endpoint);
	return {
	  blockNumber: artifacts.at.height,
	  blockHash: artifacts.at.hash,
	  genesisHash: artifacts.genesisHash,
	  specVersion: parseInt(artifacts.specVersion),
	  metadataRpc: artifacts.metadata,
	};
}

// Get information about the sending address.
async function getSenderData(sidecarHost: string, address: string): Promise<AddressData> {
	const endpoint = `${sidecarHost}/balance/${address}`;
	const addressData: AddressResponse = await sidecarGet(endpoint);
	const spendable = parseInt(addressData.free) - Math.max(
		parseInt(addressData.feeFrozen),
		parseInt(addressData.miscFrozen)
	);
	return {
		balance: spendable,
		nonce: parseInt(addressData.nonce),
	};
}

async function main(): Promise<void> {
	const chainData = await getChainData(sidecarHost);	
	const senderData = await getSenderData(sidecarHost, senderAddress);

	const registry = getRegistry('Polkadot', 'polkadot', chainData.specVersion);

	if (senderData.balance < transferValue) {
		console.log(
			`Error: Sender only has ${senderData.balance/DECIMALS} tokens available. \
			Cannot make transfer of ${transferValue/DECIMALS} tokens.`
		);
		process.exit(1);
	}

	const unsigned = methods.balances.transferKeepAlive(
    {
      value: transferValue,
      dest: recipientAddress, // Key2
    },
    {
      address: senderAddress,
      blockHash: chainData.blockHash,
      blockNumber: registry.createType('BlockNumber', chainData.blockNumber).toNumber(),
      genesisHash: chainData.genesisHash,
      metadataRpc: chainData.metadataRpc,
      nonce: senderData.nonce,
      specVersion: chainData.specVersion,
      tip,
      validityPeriod,
    },
    {
      metadata: chainData.metadataRpc,
      registry,
    }
	);
	
	// Construct the signing payload from an unsigned transaction.
  const signingPayload = createSigningPayload(unsigned, { registry });
  console.log(`\nPayload to Sign: ${signingPayload}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
