// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { construct, methods } from '@substrate/txwrapper-polkadot';
import { 
  prepareBaseTxInfo,
  SetControllerInputs,
  TxConstruction,
} from '../util/util';

export async function constructSetControllerTransaction(
  userInputs: SetControllerInputs
): Promise<TxConstruction> {
  const { baseTxInfo, optionsWithMeta } = await prepareBaseTxInfo(userInputs)

  const unsigned = methods.staking.setController(
    {
			controller: userInputs.controller,
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
