// Bond some tokens.
// import { constructBondTransaction } from './payloadConstructors/stakingBond';
// import {
//   BondInputs,
//   createAndSubmitTransaction,
//   getChainDecimals,
//   promptSignature,
//   TxConstruction,
// } from './util/util';

// const inputs: BondInputs = {
// 	senderAddress: '',
// 	controller: '',
// 	value: 7 * getChainDecimals('polkadot'),
//   payee: 'Staked',
//   tip: 0,
//   eraPeriod: 64,
//   sidecarHost: 'http://127.0.0.1:8080/',
// };

// async function main(): Promise<void> {
//   // Construct the unsigned transaction.
//   const construction: TxConstruction = await constructBondTransaction(inputs);

//   // Log the signing payload to sign offline.
//   console.log(`\nSigning Payload: ${construction.payload}`);

//   // Wait for the signature.
//   const signature = await promptSignature();

//   // Construct a signed transaction and broadcast it.
//   await createAndSubmitTransaction(construction, signature, inputs.sidecarHost);
// }

// main().catch((error) => {
//   console.error(error);
//   process.exit(1);
// });
