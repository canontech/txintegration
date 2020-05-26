// import { methods, getPolkadotStatement, getEthereumPayload } from '../txwrapper/src';
import { createSigningPayload, getRegistry, methods, getPolkadotStatement, getEthereumPayload } from '@substrate/txwrapper';
import { TxConstruction, AttestInputs, sidecarGet } from './util';

// Information about the chain that we need to construct a transaction.
interface ChainData {
  blockNumber: string;
  blockHash: string;
  genesisHash: string;
	specVersion: number;
	transactionVersion: number;
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
	txVersion: string;
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

// Get information about the chain.
async function getChainData(sidecarHost: string): Promise<ChainData> {
  const endpoint = `${sidecarHost}tx/artifacts`;
  const artifacts: ArtifactsResponse = await sidecarGet(endpoint);
  return {
    blockNumber: artifacts.at.height,
    blockHash: artifacts.at.hash,
    genesisHash: artifacts.genesisHash,
		specVersion: parseInt(artifacts.specVersion),
		transactionVersion: parseInt(artifacts.txVersion),
    metadataRpc: artifacts.metadata,
  };
}

// Get information about the sending address.
async function getSenderData(sidecarHost: string, address: string): Promise<AddressData> {
  const endpoint = `${sidecarHost}balance/${address}`;
  const addressData: AddressResponse = await sidecarGet(endpoint);
  const spendable =
    parseInt(addressData.free) -
    Math.max(parseInt(addressData.feeFrozen), parseInt(addressData.miscFrozen));
  return {
    balance: spendable,
    nonce: parseInt(addressData.nonce),
  };
}

export async function constructAttestation(userInputs: AttestInputs): Promise<TxConstruction> {
	const chainData = await getChainData(userInputs.sidecarHost);
	const senderData = await getSenderData(userInputs.sidecarHost, userInputs.senderAddress);
	const attestation = getPolkadotStatement(userInputs.agreement);

	console.log(`\nNetwork Version: ${chainData.specVersion}`);
	console.log(`Transaction Version: ${chainData.transactionVersion}`);

  const registry = getRegistry(userInputs.chainName, userInputs.specName, chainData.specVersion);

  const unsigned = methods.claims.attest(
    {
      statement: attestation.sentence,
    },
    {
      address: userInputs.senderAddress,
      blockHash: chainData.blockHash,
      blockNumber: registry.createType('BlockNumber', chainData.blockNumber).toBn().toNumber(),
      eraPeriod: 64,
      genesisHash: chainData.genesisHash,
      metadataRpc: chainData.metadataRpc,
      nonce: senderData.nonce,
			specVersion: chainData.specVersion,
			transactionVersion: chainData.transactionVersion,
      tip: userInputs.tip,
    },
    {
      metadataRpc: chainData.metadataRpc,
      registry: registry,
    },
  );

  // Construct the signing payload from an unsigned transaction.
  const signingPayload: string = createSigningPayload(unsigned, { registry });

  return {
    unsigned: unsigned,
    payload: signingPayload,
    registry: registry,
    metadata: chainData.metadataRpc,
  };
}
