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
    throw new Error(Config.errorMessage('ENVIRONMENT'));
  }

  private static errorMessage(variable: string): string {
    return `Environment variable ${variable} missing, run '. ${__dirname}/../bin/setenv.sh' to set it`;
  }

  static getPublicIP(): string {
    if (process.env.PUBLIC_IP) {
      return process.env.PUBLIC_IP;
    }
    throw new Error(Config.errorMessage('PUBLIC_IP'));
  }

  public getStringParameter(parameterName: string): string {
    return ssm.StringParameter.valueForStringParameter(this.scope, `/${Config.getEnvironment()}/${parameterName}`);
  }

  public getGlobalStringParameter(parameterName: string): string {
    return ssm.StringParameter.valueForStringParameter(this.scope, `/${parameterName}`);
  }
}

export default Config;
