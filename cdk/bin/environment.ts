// eslint-disable-next-line import/named
import { GetParametersByPathCommand, GetParametersByPathCommandOutput, SSMClient } from '@aws-sdk/client-ssm';
// eslint-disable-next-line import/named
import { GetSecretValueCommand, ListSecretsCommand, ListSecretsCommandOutput, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

const euWestSSMClient = new SSMClient({ region: 'eu-west-1' });
const euWestSecretClient = new SecretsManagerClient({ region: 'eu-west-1' });

export async function readParametersByPath(path: string): Promise<Record<string, string>> {
  const variables: Record<string, string> = {};
  let nextToken;
  do {
    const output: GetParametersByPathCommandOutput = await euWestSSMClient.send(
      new GetParametersByPathCommand({ Path: path, WithDecryption: true, NextToken: nextToken })
    );
    output.Parameters?.forEach((param) => {
      if (param.Name && param.Value) {
        variables[param.Name.replace(path, '')] = param.Value;
      }
    });
    nextToken = output.NextToken;
  } while (nextToken);
  return variables;
}

export async function readSecrets(path: string, global = false): Promise<Record<string, string>> {
  const variables: Record<string, string> = {};
  let nextToken;
  do {
    const filters = [{ Key: 'name', Values: [(global ? '!' : '') + path] }];
    const output: ListSecretsCommandOutput = await euWestSecretClient.send(new ListSecretsCommand({ Filters: filters, NextToken: nextToken }));
    for (const param of output.SecretList || []) {
      const value = await euWestSecretClient.send(new GetSecretValueCommand({ SecretId: param.ARN }));
      if (param.Name && value.SecretString) {
        variables[global ? param.Name : param.Name.replace(path, '')] = value.SecretString;
      }
    }
    nextToken = output.NextToken;
  } while (nextToken);
  return variables;
}
