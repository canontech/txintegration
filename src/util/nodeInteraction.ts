import axios from 'axios';

import { AddressData, ChainData, ChainName, Metadata, SpecName } from './types';

/* Types */

// Response from `/tx/artifacts` endpoint on sidecar. Used to create `ChainData`.
interface ArtifactsResponse {
	// Block for checkpoint
	at: {
		height: string;
		hash: string;
	};
	// Chain data
	genesisHash: string;
	chainName: ChainName;
	specName: SpecName;
	specVersion: string;
	txVersion: string;
	metadata: Metadata;
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

/* Exported Functions */

// Get information about the chain.
export async function getChainData(sidecarHost: string): Promise<ChainData> {
	const endpoint = `${sidecarHost}transaction/material`;
	const artifacts: ArtifactsResponse = await sidecarGet(endpoint);
	return {
		blockNumber: artifacts.at.height,
		blockHash: artifacts.at.hash,
		genesisHash: artifacts.genesisHash,
		chainName: artifacts.chainName,
		specName: artifacts.specName,
		specVersion: parseInt(artifacts.specVersion),
		transactionVersion: parseInt(artifacts.txVersion),
		metadataRpc: artifacts.metadata,
	};
}

// Get information about the sending address.
export async function getSenderData(sidecarHost: string, address: string): Promise<AddressData> {
	const endpoint = `${sidecarHost}accounts/${address}/balance-info`;
	const addressData: AddressResponse = await sidecarGet(endpoint);
	const spendable =
		parseInt(addressData.free) -
		Math.max(parseInt(addressData.feeFrozen), parseInt(addressData.miscFrozen));
	return {
		freeBalance: parseInt(addressData.free),
		spendableBalance: spendable,
		nonce: parseInt(addressData.nonce),
	};
}

// Submit a transaction to Sidecar to be broadcast to the network.
export async function submitTransaction(sidecarHost: string, encodedTx: string): Promise<any> {
	const endpoint = `${sidecarHost}transaction/`;
	const submission = await sidecarPost(endpoint, encodedTx);
	return submission;
}

/* Basic GET/POST interaction with Sidecar */

// Get information from the sidecar.
async function sidecarGet(url: string): Promise<any> {
	return axios.get(url).then(({ data }) => {
		return data;
	});
}

// Submit a signed tx using sidecar.
async function sidecarPost(url: string, tx: string): Promise<any> {
	return axios
		.post(
			url,
			{ tx },
			{
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
		.then(({ data }) => data)
		.then(({ cause, data, error, hash }) => {
			if (cause || error) {
				throw new Error(`${cause}: ${error} (${data})`);
			}

			return hash;
		});
}
