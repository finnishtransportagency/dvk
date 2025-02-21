import { SNSEvent } from 'aws-lambda';
import axios from 'axios';
import { getRocketChatCredentials } from '../environment';
let credentials: { rocketChatUser: string; rocketChatPassword: string } | undefined = undefined;

function getColor(result: string) {
  switch (result) {
    case 'Low':
      return '#008000';
    case 'High':
      return '#ff0000';
    default:
      return '#000000';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = async function (event: SNSEvent, context: any, callback: any) {
  if (!credentials) {
    credentials = await getRocketChatCredentials();
  }

  console.log(event);
  console.log(event.Records[0].Sns);
  const message = event.Records[0].Sns.Message;
  // get messageattributes from SNS message (attributes found in log-insights-query.ts)
  const messageAttributes = event.Records[0].Sns.MessageAttributes;

  const url = 'https://rocketchat.vaylapilvi.fi/api/v1/chat.postMessage';
  const data = {
    channel: '#DVK_notifikaatiot',
    text: `DVK daily error report`,
    attachments: [
      {
        title: `${messageAttributes.ErrorCount.Value} errors found in external API fetches`,
        text: message,
        color: getColor(messageAttributes.Severity.Value),
      },
    ],
  };

  const response = await axios.post(url, data, {
    headers: {
      'X-Auth-Token': credentials.rocketChatPassword || '',
      'X-User-Id': credentials.rocketChatUser || '',
      'Content-type': 'application/json',
    },
  });

  callback(null, `${response.status} ${response.statusText}`);
};

export { handler };
