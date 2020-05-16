import { sidecarGet } from './util';

const inputs: SyncInputs = {
	block: 2077200,
	sidecarHost: 'http://127.0.0.1:8080/'
}

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
	onInitialize: [];
	extrinsics: [];
	onFinalize: [];
}

interface Block {
	number: string;
}

// Get a block.
async function getBlock(sidecarHost: string, blockNumber?: number): Promise<Block> {
	let endpoint = `${sidecarHost}block/`;
	if (blockNumber) { endpoint = `${endpoint}${blockNumber}` }
	const blockData: BlockResponse = await sidecarGet(endpoint);
	return {
	  number: blockData.number,
	};
}

async function main(): Promise<void> {
	const block = await getBlock(inputs.sidecarHost, inputs.block);
	console.log(`Block: ${block.number}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
