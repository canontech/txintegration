import { UnsignedTransaction } from '@substrate/txwrapper-polkadot';
import { TypeRegistry } from '@polkadot/types';

export type ChainName = 'Polkadot' | 'Polkadot CC1' | 'Kusama' | 'Westend';
export type SpecName = 'polkadot' | 'kusama' | 'westend';
export type Curve = 'sr25519' | 'ed25519' | 'ecdsa';
export type Metadata = `0x$string` | `0x${string}`;

// Information about the chain that we need to construct a transaction.
export interface ChainData {
  blockNumber: string;
  blockHash: string;
  genesisHash: string;
  chainName: ChainName;
  specName: SpecName;
	specVersion: number;
	transactionVersion: number;
  metadataRpc: Metadata;
}

// Information about the sender's address.
export interface AddressData {
  freeBalance: number;
  spendableBalance: number;
  nonce: number;
}

// Information to return from unsigned transaction construction. Needed for the signing environment
// and for decoding.
export interface TxConstruction {
  unsigned: UnsignedTransaction;
  registry: TypeRegistry;
  metadata: Metadata;
}

// The type registry is somewhat mysterious to me. We just need this a lot.
export interface RegistryInfo {
  chainName: ChainName;
  specName: SpecName;
  specVersion: number;
}
