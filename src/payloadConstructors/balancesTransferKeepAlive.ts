// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { construct, getRegistry, methods } from '@substrate/txwrapper-polkadot';
import {
  getChainData,
  getChainDecimals,
  getSenderData,
  logChainData,
  TransferInputs,
  TxConstruction,
} from '../util/util';

function checkAvailableBalance(balance: number, transfer: number, decimals: number) {
  if (balance < transfer) {
    console.log(
      `Error: Sender only has ${balance / decimals} tokens available. ` +
        `Cannot make transfer of ${transfer / decimals} tokens.`,
    );
    process.exit(1);
  }
}

export async function constructTransfer(userInputs: TransferInputs): Promise<TxConstruction> {
  const chainData = await getChainData(userInputs.sidecarHost);
  const { specName, chainName, specVersion, metadataRpc } = chainData;
  const decimals = getChainDecimals(specName);
  const senderData = await getSenderData(userInputs.sidecarHost, userInputs.senderAddress);

	logChainData(chainData);
  checkAvailableBalance(senderData.spendableBalance, userInputs.transferValue, decimals);

  const registry = getRegistry({ specName, chainName, specVersion, metadataRpc });

  const unsigned = methods.balances.transferKeepAlive(
    {
      value: userInputs.transferValue,
      dest: userInputs.recipientAddress.id,
    },
    {
      address: userInputs.senderAddress,
      blockHash: chainData.blockHash,
      blockNumber: registry.createType('BlockNumber', chainData.blockNumber).toBn().toNumber(),
      eraPeriod: userInputs.eraPeriod,
      genesisHash: chainData.genesisHash,
      metadataRpc: chainData.metadataRpc,
      nonce: userInputs.nonce || senderData.nonce,
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
