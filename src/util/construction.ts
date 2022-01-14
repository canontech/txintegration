// Useful functions and types.
import { TypeRegistry } from '@polkadot/types';
import { construct, getRegistry } from '@substrate/txwrapper-polkadot';
import { getChainData, getSenderData, submitTransaction } from './nodeInteraction'
import { AddressData, ChainData, Metadata, TxConstruction } from './types'
import { promptUser } from './signing';

/* Types */

type Signature = `0x$string`;

interface BaseTxInfo {
  address: string;
  blockHash: string;
  blockNumber: number;
  eraPeriod: number;
  genesisHash: string;
  metadataRpc: Metadata;
  nonce: number;
  specVersion: number;
  transactionVersion: number;
  tip: number;
}

interface OptionsWithMeta {
  metadataRpc: Metadata;
  registry: TypeRegistry;
}

interface BaseTxInfoWithMeta {
  baseTxInfo: BaseTxInfo;
  optionsWithMeta: OptionsWithMeta;
}

interface BalanceCheck {
  check: boolean;
  amount: number;
}

/* Public Functions */

// Prepare all information needed to construct a transaction _except_ the arguments specific
// to the given transaction.
export async function prepareBaseTxInfo(
  userInputs: any,
  checkBalance: BalanceCheck
): Promise<BaseTxInfoWithMeta> {
  const chainData: ChainData = await getChainData(userInputs.sidecarHost);
  const { specName, chainName, specVersion, metadataRpc } = chainData;
  const senderData: AddressData = await getSenderData(
    userInputs.sidecarHost,
    userInputs.senderAddress,
  );

	logChainData(chainData);

  if (checkBalance.check) {
    const decimals = getChainDecimals(specName);
    checkAvailableBalance(senderData.spendableBalance, checkBalance.amount, decimals);
  }

  const registry = getRegistry({ specName, chainName, specVersion, metadataRpc });

  const baseTxInfo = {
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
    };
  
    const optionsWithMeta = {
      metadataRpc: chainData.metadataRpc,
      registry,
    };

    return { baseTxInfo, optionsWithMeta }
}

// Ask the user for a signature to create a signed transaction and broadcast it to a node.
export async function createAndSubmitTransaction(
  construction: TxConstruction,
  sidecarHost: string,
) {
  // Ask the user for a signature.
  const signature = toSignature(await promptUser('Signature'));

  // Construct a signed transaction.
  const tx = construct.signedTx(construction.unsigned, signature, {
    metadataRpc: construction.metadata,
    registry: construction.registry,
  });
  console.log(`\nEncoded Transaction: ${tx}`);

  // Log the expected hash.
  const expectedTxHash = construct.txHash(tx);
  console.log(`\nExpected Tx Hash: ${expectedTxHash}`);

  // Submit the transaction. Should return the actual hash if accepted by the node.
  const submission = await submitTransaction(sidecarHost, tx);
  console.log(`\nNode Response: ${submission}`);
}

/* Private Functions */

// Check the spendable `balance` of an account compare with the `amount` it would like to transact
// with. Log an error and exit if it does not have enough.
function checkAvailableBalance(balance: number, amount: number, decimals: number) {
  if (balance < amount) {
    console.log(
      `Error: Sender only has ${balance / decimals} spendable tokens. ` +
        `Cannot transact with ${amount / decimals} tokens.`,
    );
    process.exit(1);
  }
}

// Log information about a chain.
function logChainData(chainData: ChainData) {
  console.log(`\nChain Name: ${chainData.chainName}`);
  console.log(`Spec Name:  ${chainData.specName}`);
	console.log(`Network Version: ${chainData.specVersion}`);
	console.log(`Transaction Version: ${chainData.transactionVersion}`);
}

// Get the number of decimals used to represent a token on a given `chain`.
function getChainDecimals(chain: string): number {
  let decimals: number;
  if (chain == 'polkadot') {
    decimals = 10_000_000_000;
  }
  else if (chain == 'kusama') {
    decimals = 1_000_000_000_000;
  }
  else {
    console.log(`Chain ${chain} unknown, returning units.`)
    decimals = 1;
  }
  return decimals
}

// Return a string as a signature.
function toSignature(s: string): Signature {
  return s as Signature;
}
