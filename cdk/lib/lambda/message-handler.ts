import { SNSEvent } from 'aws-lambda';
import axios from 'axios';
const rocketUser = process.env.ROCKETCHAT_USER;
const rocketPassword = process.env.ROCKETCHAT_PASSWORD;

const handler = async function (event: SNSEvent, context: any, callback: any) {
  console.log(event);
  console.log(event.Records[0].Sns);
  const message = event.Records[0].Sns.Message;

  const url = 'https://rocketchat.vaylapilvi.fi/api/v1/chat.postMessage';
  const data = {
    channel: '#DVK_notifications',
    text: message,
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
