import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

class Config {
  private scope: Construct;

  constructor(scope: Construct) {
    this.scope = scope;
  }

  static isPermanentEnvironment() {
    return ['dev', 'test', 'prod'].indexOf(Config.getEnvironment()) >= 0;
  }

  static getEnvironment(): string {
    if (process.env.ENVIRONMENT) {
      return process.env.ENVIRONMENT;
    }
    throw new Error('Environment variable ENVIRONMENT missing');
  }

  public getStringParameter(parameterName: string): string | undefined {
    if (Config.isPermanentEnvironment()) {
      return ssm.StringParameter.valueForStringParameter(this.scope, `/${Config.getEnvironment()}/${parameterName}`);
    }
    return undefined;
  }
}

export default Config;
