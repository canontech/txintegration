// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import {
  createSigningPayload,
  getRegistry,
  methods,
} from '@substrate/txwrapper';
import { TxConstruction, UserInputs, DECIMALS } from './util';

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
	const endpoint = `${sidecarHost}balance/${address}`;
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

function checkAvailableBalance(balance: number, transfer: number, decimals: number) {
	if (balance < transfer) {
		console.log(
			`Error: Sender only has ${balance/decimals} tokens available. `
			+ `Cannot make transfer of ${transfer/decimals} tokens.`
		);
		process.exit(1);
	}
}

export async function constructTransaction(userInputs: UserInputs): Promise<TxConstruction> {
	const chainData = await getChainData(userInputs.sidecarHost);	
	const senderData = await getSenderData(userInputs.sidecarHost, userInputs.senderAddress);

	console.log(`\nNetwork Version: ${chainData.specVersion}`);

	checkAvailableBalance(senderData.balance, userInputs.transferValue, DECIMALS);

	const registry = getRegistry(
		userInputs.chainName,
		userInputs.specName,
		chainData.specVersion
	);

	const unsigned = methods.balances.transferKeepAlive(
    {
      value: userInputs.transferValue,
      dest: userInputs.recipientAddress,
    },
    {
      address: userInputs.senderAddress,
      blockHash: chainData.blockHash,
      blockNumber: registry.createType('BlockNumber', chainData.blockNumber).toBn().toNumber(),
      genesisHash: chainData.genesisHash,
      metadataRpc: chainData.metadataRpc,
      nonce: userInputs.nonce || senderData.nonce,
      specVersion: chainData.specVersion,
      tip: userInputs.tip,
      validityPeriod: userInputs.validityPeriod,
    },
    {
      metadata: chainData.metadataRpc,
      registry,
    }
	);
	
	// Construct the signing payload from an unsigned transaction.
	const signingPayload: string = createSigningPayload(unsigned, { registry });
	
	return {
		unsigned: unsigned,
		payload: signingPayload,
		registry: registry,
		metadata: chainData.metadataRpc
	};
}
