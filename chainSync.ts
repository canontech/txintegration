import { sidecarGet } from './util';

const inputs: SyncInputs = {
  block: 2077200,
  sidecarHost: 'http://127.0.0.1:8080/',
};

interface SyncInputs {
  block?: number;
  sidecarHost: string;
}

interface BlockResponse {
  number: string;
  hash: string;
  parentHash: string;
  stateRoot: string;
  extrinsicsRoot: string;
  logs: [];
  onInitialize: { events: [Event] };
  extrinsics: [Extrinsic];
  onFinalize: { events: [Event] };
}

interface Block {
	header: {
		number: number;
		hash: string;
		parentHash: string;
		stateRoot: string;
		extrinsicsRoot: string;
		logs: [];
	};
  onInitialize: {
		events: [Event];
	};
  extrinsics: [Extrinsic];
  onFinalize: {
		events: [Event];
	};
}

interface Event {
	method: string;
	data: [any];
}

interface Signature {
	signature: string;
	signer: string;
}

interface Extrinsic {
	method: string;
	signature: null | Signature;
	nonce: string;
	args: [string];
	tip: string;
	hash: string;
	info: {
		weight: string;
		class: string;
		partialFee: string
	};
	events: [Event];
	success: boolean;
	paysFee: boolean;
}

// Get a block.
async function getBlock(sidecarHost: string, blockNumber?: number): Promise<Block> {
  let endpoint = `${sidecarHost}block/`;
  if (blockNumber) {
    endpoint = `${endpoint}${blockNumber}`;
  }
	const blockData: BlockResponse = await sidecarGet(endpoint);
	console.log(blockData.extrinsics);
  return {
		header: {
			number: parseInt(blockData.number),
			hash: blockData.hash,
			parentHash: blockData.parentHash,
			stateRoot: blockData.stateRoot,
			extrinsicsRoot: blockData.extrinsicsRoot,
			logs: blockData.logs,
		},
		onInitialize: blockData.onInitialize,
		extrinsics: blockData.extrinsics,
		onFinalize: blockData.onFinalize
  };
}

async function main(): Promise<void> {
  const block = await getBlock(inputs.sidecarHost, inputs.block);
	console.log(`\nBlock ${block.header.number} has ${block.extrinsics.length} extrinsics`);
	console.log(`\nExtrinsic: ${block.extrinsics}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
