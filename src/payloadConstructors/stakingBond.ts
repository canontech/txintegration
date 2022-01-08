// Connect to a sidecar host and fetch the pertinant info to construct a transaction.
import { construct, decode, methods } from '@substrate/txwrapper-polkadot';
import { DecodedUnsignedTx } from '@substrate/txwrapper-polkadot/lib/index';
import { createAndSubmitTransaction, prepareBaseTxInfo } from '../util/construction';
import { BondInputs } from '../util/inputTypes';

function logUnsignedInfo(decoded: DecodedUnsignedTx) {
  console.log(
    `\nTransaction Details:` +
      `\n  Sending Account: ${decoded.address}` +
      `\n  Controller:      ${decoded.method.args.controller}` +
			`\n  Value: ${decoded.method.args.value}` +
			`\n  Payee: ${decoded.method.args.payee}` +
      `\n  Tip: ${decoded.tip}` +
      `\n  Era Period: ${decoded.eraPeriod}`,
  );
}

export async function doStakingBond(userInputs: BondInputs): Promise<void> {
  const { baseTxInfo, optionsWithMeta } = await prepareBaseTxInfo(
    userInputs,
    { check: true, amount: userInputs.value }
  );

  const unsigned = methods.staking.bond(
    {
			controller: userInputs.controller,
      value: userInputs.value,
      payee: userInputs.payee,
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
