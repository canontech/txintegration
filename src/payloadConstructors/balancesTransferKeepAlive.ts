// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { construct, methods } from '@substrate/txwrapper-polkadot';
import {
  prepareBaseTxInfo,
  TransferInputs,
  TxConstruction,
} from '../util/util';

export async function constructTransfer(userInputs: TransferInputs): Promise<TxConstruction> {
  const { baseTxInfo, optionsWithMeta } = await prepareBaseTxInfo(
    userInputs,
    { check: true, amount: userInputs.transferValue }
  );

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
