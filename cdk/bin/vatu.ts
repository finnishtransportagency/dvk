import axios from 'axios';
import { readParametersByPath } from './environment';

async function main() {
  const parameters = await readParametersByPath('/');
  const authorization = Buffer.from(`${parameters.VatuUsername}:${parameters.VatuPassword}`).toString('base64');
  const response = await axios.get(`${parameters.VatuUrl}/turvalaitteet?vaylaluokka=1,2,99`, {
    headers: {
      'Content-type': 'application/json',
      'Accept-Encoding': 'gzip',
      Authorization: `Basic ${authorization}`,
    },
  });
  console.log(JSON.stringify(response.data, undefined, 2));
}

main().catch((e) => {
  console.log(e);
  process.exit(1);
});
