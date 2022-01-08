// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { construct, decode, methods } from '@substrate/txwrapper-polkadot';
import { DecodedUnsignedTx } from '@substrate/txwrapper-polkadot/lib/index';
import { createAndSubmitTransaction, prepareBaseTxInfo } from '../util/construction';
import { BondExtraInputs } from '../util/inputTypes';

function logUnsignedInfo(decoded: DecodedUnsignedTx) {
  console.log(
    `\nTransaction Details:` +
      `\n  Sending Account: ${decoded.address}` +
			`\n  Value: ${decoded.method.args.maxAdditional}` +
      `\n  Tip: ${decoded.tip}` +
      `\n  Era Period: ${decoded.eraPeriod}`,
  );
}

export async function doStakingBondExtra(userInputs: BondExtraInputs): Promise<void> {
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

  // Verify transaction details.
  const decodedUnsigned = decode(unsigned, {
    metadataRpc: optionsWithMeta.metadataRpc,
    registry: optionsWithMeta.registry,
  });
  logUnsignedInfo(decodedUnsigned);

  // Construct the signing payload from an unsigned transaction.
  const signingPayload: string = construct.signingPayload(unsigned, optionsWithMeta);

  // Log the signing payload to sign offline.
  console.log(`\nSigning Payload: ${signingPayload}`);

  // Construct a signed transaction and broadcast it.
  await createAndSubmitTransaction(
    {
      unsigned: unsigned,
      registry: optionsWithMeta.registry,
      metadata: optionsWithMeta.metadataRpc,
    },
    userInputs.sidecarHost
  );
}
