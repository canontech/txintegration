// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { construct, methods } from '@substrate/txwrapper-polkadot';
import { 
  BondExtraInputs,
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

export async function constructBondExtra(userInputs: BondExtraInputs): Promise<TxConstruction> {
  const { baseTxInfo, optionsWithMeta } = await prepareBaseTxInfo(userInputs)
  // checkAvailableBalance(senderData.spendableBalance, userInputs.maxAdditional, decimals);

  const unsigned = methods.staking.bondExtra(
    {
			maxAdditional: userInputs.maxAdditional,
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
