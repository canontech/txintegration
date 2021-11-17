// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { construct, methods } from '@substrate/txwrapper-polkadot';
import { 
  BondExtraInputs,
  prepareBaseTxInfo,
  TxConstruction,
} from '../util/util';

export async function constructBondExtra(userInputs: BondExtraInputs): Promise<TxConstruction> {
  const { baseTxInfo, optionsWithMeta } = await prepareBaseTxInfo(
    userInputs,
    { check: true, amount: userInputs.maxAdditional }
  );

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
