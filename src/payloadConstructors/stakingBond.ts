// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { construct, getRegistry, methods } from '@substrate/txwrapper-polkadot';
import { 
  BondInputs,
  prepareBaseTxInfo,
  TxConstruction,
} from '../util/util';

// function checkAvailableBalance(balance: number, bond: number, decimals: number) {
//   if (balance < bond) {
//     console.log(
//       `Error: Sender only has ${balance / decimals} tokens available. ` +
//         `Cannot bond ${bond / decimals} tokens.`,
//     );
//     process.exit(1);
//   }
// }

export async function constructBondTransaction(userInputs: BondInputs): Promise<TxConstruction> {
  const { baseTxInfo, optionsWithMeta } = await prepareBaseTxInfo(userInputs)
  // checkAvailableBalance(senderData.freeBalance, userInputs.value, decimals);

  const unsigned = methods.staking.bond(
    {
			controller: userInputs.controller,
      value: userInputs.value,
      payee: userInputs.payee,
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
