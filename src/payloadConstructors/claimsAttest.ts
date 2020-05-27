// import { methods, getPolkadotStatement } from '../txwrapper/src';
import {
	createSigningPayload,
	getRegistry,
	methods,
	getPolkadotStatement
} from '@substrate/txwrapper';
import {
  getChainData,
  getSenderData,
  TxConstruction, 
  AttestInputs 
} from '../util/util';

export async function constructAttestation(userInputs: AttestInputs): Promise<TxConstruction> {
	const chainData = await getChainData(userInputs.sidecarHost);
	const senderData = await getSenderData(userInputs.sidecarHost, userInputs.senderAddress);
	const attestation = getPolkadotStatement(userInputs.agreement);

	console.log(`\n${attestation.sentence}`);

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
