import { CodePipelineEvent, Context, Callback } from 'aws-lambda';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import axios from 'axios';
const rocketUser = process.env.ROCKETCHAT_USER;
const rocketPassword = process.env.ROCKETCHAT_PASSWORD;

const handler = async function (event: CodePipelineEvent, context: Context, callback: Callback) {
  console.log(event);
  console.log(context.awsRequestId);

  const url = 'https://rocketchat.vaylapilvi.fi/api/v1/chat.postMessage';
  const data = {
    channel: '#DVK_notifications',
    text: 'Hello from lambda',
  };

  const response = await axios.post(url, data, {
    headers: {
      'X-Auth-Token': rocketPassword || '',
      'X-User-Id': rocketUser || '',
      'Content-type': 'application/json',
    },
  });

  callback(null, 'OK');
};

export { handler };
