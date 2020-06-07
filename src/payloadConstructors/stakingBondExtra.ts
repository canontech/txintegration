// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { createSigningPayload, getRegistry, methods } from '@substrate/txwrapper';
import { createMetadata } from '@substrate/txwrapper/lib/util';
import { 
  getChainData,
  getSenderData,
  TxConstruction, 
  BondExtraInputs, 
  DECIMALS 
} from '../util/util';

function checkAvailableBalance(balance: number, bond: number, decimals: number) {
  if (balance < bond) {
    console.log(
      `Error: Sender only has ${balance / decimals} tokens available. ` +
        `Cannot bond ${bond / decimals} tokens.`,
    );
    process.exit(1);
  }
}

export async function constructBondExtra(userInputs: BondExtraInputs): Promise<TxConstruction> {
  const chainData = await getChainData(userInputs.sidecarHost);
  const senderData = await getSenderData(userInputs.sidecarHost, userInputs.senderAddress);

  console.log(`\nChain Name: ${chainData.chainName}`);
  console.log(`Spec Name:  ${chainData.specName}`);
	console.log(`Network Version: ${chainData.specVersion}`);
	console.log(`Transaction Version: ${chainData.transactionVersion}`);

  checkAvailableBalance(senderData.spendableBalance, userInputs.maxAdditional, DECIMALS);

  const registry = getRegistry(userInputs.chainName, userInputs.specName, chainData.specVersion);
  registry.setMetadata(createMetadata(registry, chainData.metadataRpc));

  const unsigned = methods.staking.bondExtra(
    {
			maxAdditional: userInputs.maxAdditional,
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
