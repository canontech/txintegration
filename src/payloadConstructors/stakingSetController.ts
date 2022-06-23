// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { construct, decode, methods } from '@substrate/txwrapper-polkadot';
import { DecodedUnsignedTx } from '@substrate/txwrapper-polkadot/lib/index';

import { createAndSubmitTransaction, prepareBaseTxInfo } from '../util/construction';
import { SetControllerInputs } from '../util/inputTypes';

function logUnsignedInfo(decoded: DecodedUnsignedTx) {
  console.log(
    `\nTransaction Details:` +
      `\n  Sending Account: ${decoded.address}` +
      `\n  Controller:      ${decoded.method.args.controller}` +
      `\n  Tip: ${decoded.tip}` +
      `\n  Era Period: ${decoded.eraPeriod}`,
  );
}

export async function doStakingSetController(userInputs: SetControllerInputs): Promise<void> {
  const { baseTxInfo, optionsWithMeta } = await prepareBaseTxInfo(userInputs, {
    check: false,
    amount: 0,
  });

  const unsigned = methods.staking.setController(
    {
      controller: userInputs.controller,
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
    userInputs.sidecarHost,
  );
}
