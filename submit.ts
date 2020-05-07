import axios from 'axios'

// Submit a signed tx using sidecar.
async function sidecarPost(url: string, tx: string): Promise<any> {
  return axios.post(url, { tx }, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(({ data }) => data)
    .then(({ error, result }) => {
      if (error) {
        throw new Error(error);
      }

      return result;
    });
}

export async function submitTransaction(sidecarHost: string, encodedTx: string): Promise<any> {
  const endpoint = `${sidecarHost}tx/`;
  const submission = await sidecarPost(endpoint, encodedTx);
  return submission;
}
