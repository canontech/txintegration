import { UnsignedTransaction } from '@substrate/txwrapper-polkadot';
import { TypeRegistry } from '@polkadot/types';

export type ChainName = 'Polkadot' | 'Polkadot CC1' | 'Kusama' | 'Westend';
export type SpecName = 'polkadot' | 'kusama' | 'westend';
export type Curve = 'sr25519' | 'ed25519' | 'ecdsa';

// Information about the chain that we need to construct a transaction.
export interface ChainData {
  blockNumber: string;
  blockHash: string;
  genesisHash: string;
  chainName: ChainName;
  specName: SpecName;
	specVersion: number;
	transactionVersion: number;
  metadataRpc: string;
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
  metadata: string;
}

// The type registry is somewhat mysterious to me. We just need this a lot.
export interface RegistryInfo {
  chainName: ChainName;
  specName: SpecName;
  specVersion: number;
}
