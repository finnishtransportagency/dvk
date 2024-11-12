import { SNSEvent } from 'aws-lambda';
import axios from 'axios';
import { getRocketChatCredentials } from './environment';
let credentials: { rocketChatUser: string; rocketChatPassword: string } | undefined = undefined;

function getColor(result: string) {
  switch (result) {
    case 'SUCCEEDED':
      return '#008000';
    case 'FAILED':
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
  const details = JSON.parse(message).detail;
  const codebuildURL = `https://eu-west-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/${details.pipeline}/executions/${details['execution-id']}/timeline?region=eu-west-1`;

  const url = 'https://rocketchat.vaylapilvi.fi/api/v1/chat.postMessage';
  const data = {
    channel: '#DVK_notifikaatiot',
    text: `Pipeline state change: ${details.pipeline}`,
    attachments: [
      {
        title: details.state,
        title_link: codebuildURL,
        text: codebuildURL,
        color: getColor(details.state),
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
