import axios from 'axios';

import { AddressData, ChainData, ChainName, Metadata, SpecName } from './types';

/* Types */

type ApiResponse<T> = T & {
	at: {
		height: string;
		hash: string;
	};
};

// Response from `/transaction/material` endpoint on sidecar. Used to create `ChainData`.
interface MaterialsResponse {
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
	// Address data
	nonce: string;
	free: string;
	reserved: string;
	miscFrozen: string;
	feeFrozen: string;
	locks: [];
}

interface PostResponseData {
	cause?: string;
	data: string;
	error?: string;
	hash: string;
}

/* Exported Functions */

// Get information about the chain.
export async function getChainData(sidecarHost: string): Promise<ChainData> {
	const endpoint = `${sidecarHost}transaction/material`;
	const artifacts = await sidecarGet<MaterialsResponse>(endpoint);
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
	const addressData = await sidecarGet<AddressResponse>(endpoint);
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
export async function submitTransaction(sidecarHost: string, encodedTx: string): Promise<unknown> {
	const endpoint = `${sidecarHost}transaction/`;
	const submission = await sidecarPost(endpoint, encodedTx);
	return submission;
}

/* Basic GET/POST interaction with Sidecar */

// Get information from the sidecar.
async function sidecarGet<T>(url: string): Promise<ApiResponse<T>> {
	return axios.get(url).then(({ data }: { data: ApiResponse<T> }) => {
		return data;
	});
}

// Submit a signed tx using sidecar.
async function sidecarPost(url: string, tx: string): Promise<unknown | string> {
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
		.then(({ data }: { data: PostResponseData }) => data)
		.then(({ cause, data, error, hash }) => {
			if (cause || error) {
				throw new Error(`${cause}: ${error} (${data})`);
			}

			return hash;
		});
}
