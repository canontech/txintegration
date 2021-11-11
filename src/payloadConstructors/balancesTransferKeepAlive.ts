// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { construct, methods } from '@substrate/txwrapper-polkadot';
import {
  prepareBaseTxInfo,
  TransferInputs,
  TxConstruction,
} from '../util/util';

// function checkAvailableBalance(balance: number, transfer: number, decimals: number) {
//   if (balance < transfer) {
//     console.log(
//       `Error: Sender only has ${balance / decimals} tokens available. ` +
//         `Cannot make transfer of ${transfer / decimals} tokens.`,
//     );
//     process.exit(1);
//   }
// }

export async function constructTransfer(userInputs: TransferInputs): Promise<TxConstruction> {
  const { baseTxInfo, optionsWithMeta } = await prepareBaseTxInfo(userInputs)
  
  // checkAvailableBalance(senderData.spendableBalance, userInputs.transferValue, decimals);

  const unsigned = methods.balances.transferKeepAlive(
    {
      value: userInputs.transferValue,
      dest: userInputs.recipientAddress.id,
    },
    baseTxInfo,
    optionsWithMeta,
  );

  // Construct the signing payload from an unsigned transaction.
  const signingPayload: string = construct.signingPayload(unsigned, optionsWithMeta);

  return {
    unsigned: unsigned,
    payload: signingPayload,
    registry: optionsWithMeta.registry,
    metadata: optionsWithMeta.metadataRpc,
  };
}
