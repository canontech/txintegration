// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { construct, getRegistry, methods } from '@substrate/txwrapper-polkadot';
import { 
  AddProxyInputs,
  getChainData,
  getSenderData,
  logChainData,
  TxConstruction,
} from '../util/util';

export async function constructAddProxyTransaction(userInputs: AddProxyInputs): Promise<TxConstruction> {
  const chainData = await getChainData(userInputs.sidecarHost);
  const { specName, chainName, specVersion, metadataRpc } = chainData;
  const senderData = await getSenderData(userInputs.sidecarHost, userInputs.senderAddress);

  logChainData(chainData);

  const registry = getRegistry({ specName, chainName, specVersion, metadataRpc });

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
  const signingPayload: string = construct.signingPayload(unsigned, { registry });

  return {
    unsigned: unsigned,
    payload: signingPayload,
    registry: registry,
    metadata: chainData.metadataRpc,
  };
}
