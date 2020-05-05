async function main(): Promise<void> {
	console.log('hello');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
