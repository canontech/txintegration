/* Useful types */

type Payee = 'Staked' | 'Stash' | 'Controller';

/* User Interfaces */

export interface BaseUserInputs {
	// Address sending the transaction.
	senderAddress: string;
	// Tip for block producer.
	tip: number;
	// Number of blocks for which this transaction is valid.
	eraPeriod: number;
	// Host that is running sidecar.
	sidecarHost: string;
	// Override the chain's nonce.
	nonce?: number;
}

export interface TransferInputs extends BaseUserInputs {
	// Address receiving the transfer.
	recipientAddress: { id: string };
	// Number of tokens to transfer.
	transferValue: number;
}

export interface BondInputs extends BaseUserInputs {
	// The account that will be the staking Controller.
	controller: string;
	// The number of tokens to stake.
	value: number;
	// Rewards destination. Can be 'Staked', 'Stash', or 'Controller'.
	payee: Payee;
}

export interface BondExtraInputs extends BaseUserInputs {
	// The number of tokens to stake.
	maxAdditional: number;
}

export interface SetControllerInputs extends BaseUserInputs {
	// The SS-58 encoded controller address.
	controller: string;
}

export interface RemarkInputs extends BaseUserInputs {
	// The remark to put on chain.
	remark: string;
}

export interface AddProxyInputs extends BaseUserInputs {
	// The account to set as proxy.
	delegate: string;
	// The permissions for this proxy account.
	proxyType: string;
	// The number of blocks delay for this proxy.
	delay: number | string;
}

export interface RemoveProxyInputs extends BaseUserInputs {
	// The account to set as proxy.
	delegate: string;
	// The permissions for this proxy account.
	proxyType: string;
	// The number of blocks delay for this proxy.
	delay: number | string;
}
