// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { createSigningPayload, getRegistry, methods } from '@substrate/txwrapper';
import { createMetadata } from '@substrate/txwrapper/lib/util';
import { 
  getChainData,
  getSenderData,
  logChainData,
  RemoveProxyInputs,
  TxConstruction,
} from '../util/util';

export async function constructRemoveProxyTransaction(userInputs: RemoveProxyInputs): Promise<TxConstruction> {
  const chainData = await getChainData(userInputs.sidecarHost);
  const senderData = await getSenderData(userInputs.sidecarHost, userInputs.senderAddress);

  logChainData(chainData);

  const registry = getRegistry(chainData.chainName, chainData.specName, chainData.specVersion);
  registry.setMetadata(createMetadata(registry, chainData.metadataRpc));

  const unsigned = methods.proxy.addProxy(
    {
			delegate: userInputs.delegate,
      proxyType: userInputs.proxyType,
      delay: userInputs.delay,
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
      registry,
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
