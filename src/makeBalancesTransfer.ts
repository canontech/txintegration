// Construct and submit a `balance.transfer` transaction.
// import { constructTransfer } from './payloadConstructors/balancesTransfer';
// import {
//   createAndSubmitTransaction,
//   getChainDecimals,
//   promptSignature,
//   TransferInputs,
//   TxConstruction,
// } from './util/util';
// import { readFileSync } from 'fs';

// const transactionDetails = JSON.parse(readFileSync('transaction.json').toString())

// const inputs: TransferInputs = {
//   senderAddress: transactionDetails.sender,
//   recipientAddress: transactionDetails.balances_transferKeepAlive.recipientAddress,
//   transferValue: 
//     transactionDetails.balances_transferKeepAlive.value *
//     getChainDecimals(transactionDetails.network),
//   tip: transactionDetails.tip,
//   eraPeriod: transactionDetails.eraPeriod,
//   sidecarHost: transactionDetails.sidecarHost,
// };

// async function main(): Promise<void> {
//   // Construct the unsigned transaction.
//   const construction: TxConstruction = await constructTransfer(inputs);

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
