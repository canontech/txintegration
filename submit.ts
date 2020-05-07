// Submit a signed tx using sidecar.
async function sidecarPost(url: string, tx: string): Promise<any> {
  return fetch(url, {
    body: JSON.stringify({
      data: `{"tx": "${tx}"}`
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
    .then((response) => response.json())
    .then(({ error, result }) => {
      if (error) {
        throw new Error(error.message);
      }

      return result;
    });
}

export async function submitTransaction(sidecarHost: string, encodedTx: string): Promise<any> {
	const submission = await sidecarPost(sidecarHost, encodedTx);
	return submission;
}
