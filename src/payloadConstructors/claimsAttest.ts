// Connect to Sidecar and construct a `claims.attest` transaction.
import {
	createSigningPayload,
	getRegistry,
	methods,
	getPolkadotStatement
} from '@substrate/txwrapper';
import { createMetadata } from '@substrate/txwrapper/lib/util';
import {
  AttestInputs,
  getChainData,
  getSenderData,
  logChainData,
  TxConstruction,
} from '../util/util';

export async function constructAttestation(userInputs: AttestInputs): Promise<TxConstruction> {
	const chainData = await getChainData(userInputs.sidecarHost);
	const senderData = await getSenderData(userInputs.sidecarHost, userInputs.senderAddress);
	const attestation = getPolkadotStatement(userInputs.agreement);

	console.log(`\n${attestation.sentence}`);

	logChainData(chainData);

  const registry = getRegistry(userInputs.chainName, userInputs.specName, chainData.specVersion);
  registry.setMetadata(createMetadata(registry, chainData.metadataRpc));

  const unsigned = methods.claims.attest(
    {
      statement: attestation.sentence,
    },
    {
      address: userInputs.senderAddress,
      blockHash: chainData.blockHash,
      blockNumber: registry.createType('BlockNumber', chainData.blockNumber).toBn().toNumber(),
      eraPeriod: userInputs.eraPeriod,
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
