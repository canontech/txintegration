import axios from 'axios'

// Submit a signed tx using sidecar.
async function sidecarPost(url: string, tx: string): Promise<any> {
  return axios.post(url, { tx }, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(({ data }) => data)
    .then(({ cause, data, error, hash }) => {
      if (cause || error) {
        throw new Error(`${cause}: ${error} (${data})`);
      }

      return hash;
    });
}

export async function submitTransaction(sidecarHost: string, encodedTx: string): Promise<any> {
  const endpoint = `${sidecarHost}tx/`;
  const submission = await sidecarPost(endpoint, encodedTx);
  return submission;
}
