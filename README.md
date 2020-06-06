# Sidecar and TxWrapper Integration

This is a guide to using
[Substrate API Sidecar](https://github.com/paritytech/substrate-api-sidecar) and
[TxWrapper](https://github.com/paritytech/txwrapper) to construct, sign, and submit a transaction to
a Substrate-based chain.

> Note: This will work on any Substrate-based chain, but for now is only set up to work on Polkadot
> or a development chain using Polkadot's SS58 address encoding.

<p align="center">
⚠️ ⚠️ ⚠️

The current version of Polkadot
<a href="https://github.com/paritytech/polkadot/blob/v0.8.1/runtime/polkadot/src/lib.rs#L106L131">restricts</a>
many transactions, including balance transfers, so `yarn start` will fail. Try using `yarn bond`
instead.
</p>

## Instructions

Tested on:

- Polkadot v0.8.2
- Sidecar v0.7.0
- Txwrapper v3.1.2

### Start a Node

If you have access to a sidecar endpoint, then you can skip this step.

Start a Polkadot node. Can be local development node (`--dev`) or connect to mainnet. See the
[Polkadot repo](https://github.com/paritytech/polkadot) for instructions.

### Set up Sidecar

Clone the sidecar repo and start with `yarn; yarn start;`. It will connect to `localhost` by default
and start an http server on port 8080.

### Run

The main function will:

1. Connect to the sidecar and collect all the necessary information to construct a transaction.
1. Create a signing payload for a balance transfer.
1. Wait for you to sign the payload.
1. Submit the transaction.

#### Construction

In `index.ts` you will need to enter the transaction parameters:

```ts
const inputs: TransferInputs = {
  senderAddress: '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5', //Alice
  recipientAddress: '14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3', //Bob
  transferValue: 1 * DECIMALS, // DOTs
  tip: 0 * DECIMALS, // DOTs
  eraPeriod: 64, // Blocks
  chainName: 'Polkadot', // 'Polkadot', 'Kusama', or 'Westend'
  specName: 'polkadot', // 'polkadot', 'kusama', or 'westend'
  sidecarHost: 'http://127.0.0.1:8080/', // Sidecar
};
```

Run `yarn start` and you will get:

```bash
Network Version: 0

Transaction Details:
  Sending Account:   15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5
  Receiving Account: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3
  Amount: 1000000000000
  Tip:    0

Signing Payload: 0xa005038eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48070010a5d4e895030000f00300003a5dacb3a8725d578ab4b1457764e960a86b17720c3d39086c3b0872122b7a41f837b149dcb20f92540a027e58aab0554d2d42f36887f33a5e6a85ebdd0f13d8

Signature:
```

This will wait for you to sign the payload.

#### Signing

You can sign the payload in any way you like. Ideally, you should do this on a secure, offline
device. A signing script is provided to use for testing.

In `sign.ts`, enter the sending account and network version from the last step. You will also need
the metadata from the first part, but this only changes on runtime upgrades. This repo contains a
file with metadata for well known runtimes, like Polkadot, with the name
`<specName>Metadata<version>`, e.g. `polkadotMetadata1`.

```ts
// Make sure this matches the chain's metadata from the previous step.
import { polkadotMetadata1 } from './metadata';

// Make sure these match the chain you are using.
const registryInputs: RegistryInfo = {
  chainName: 'Polkadot',
  specName: 'polkadot',
  specVersion: 1, // Network Version from previous step
};
```

Create a new file called `key.ts` that exports a signing key and type. An example for 'Alice' is
provided. In here you can put your signing key. It can be a 12 word phrase or secret seed. Or, in
the case of a dev chain, just `//Alice`:

```ts
// Key type. Must be one of 'sr25519', 'ed25519', or 'ecdsa'.
export const curve = 'sr25519';
// The actual signing key. Can include `//hard-derivation`, `/soft-derivation`, or `///password`.
export const signingKey = '//Alice';
// Address that corresponds to the signing key.
export const senderAddress = '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5';
```

Run `yarn ts-node src/sign.ts` and enter the signing payload from the last step to get a signature:

```bash
$ yarn ts-node src/sign.ts

Payload: <enter the signing payload here>

Signature: 0x014679aaf0589f456f57875837c3c3f9747dee901304e05fe9511eece5bfd68c1e7443ff6d476f170d80cbbabae5f6bd3cf3d486663fe8f68d48e8ea7c70edc18d
```

#### Submission

Paste this signature into the terminal that is waiting, press enter, and it will submit the
transaction to your node.

### Other Functions

This repo also provides similar setups for making claims attestations, making remarks, and bonding
tokens. They follow similar patterns like modifying a user inputs section at the top and then
waiting for a signature.
