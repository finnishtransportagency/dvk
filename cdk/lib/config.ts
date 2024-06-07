import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

class Config {
  private scope: Construct;

  public static readonly tags = { Environment: Config.getEnvironment(), Project: 'dvk' };

  constructor(scope: Construct) {
    this.scope = scope;
  }

  static isPermanentEnvironment() {
    return ['dev', 'test', 'prod'].indexOf(Config.getEnvironment()) >= 0;
  }

  static isProductionEnvironment() {
    return 'prod' === Config.getEnvironment();
  }

  static isFeatureEnvironment(env?: string) {
    return (env ?? Config.getEnvironment()).startsWith('feature');
  }

  static isDeveloperEnvironment(env?: string) {
    return !this.isFeatureEnvironment(env) && ['dev', 'test', 'prod'].indexOf(env ?? Config.getEnvironment()) < 0;
  }

  static isDeveloperOrDevEnvironment() {
    return this.isDeveloperEnvironment() || 'dev' === Config.getEnvironment();
  }

  static getEnvironment(): string {
    if (process.env.ENVIRONMENT) {
      return process.env.ENVIRONMENT;
    }
    throw new Error(Config.errorMessage('ENVIRONMENT'));
  }

  // the new table with sort keys for versioning
  static getFairwayCardWithVersionsTableName(): string {
    return `FairwayCardWithVersions-${Config.getEnvironment()}`;
  }

  static getFairwayCardTableName(): string {
    return `FairwayCard-${Config.getEnvironment()}`;
  }

  static getHarborWithVersionsTableName(): string {
    return `HarborWithVersions-${Config.getEnvironment()}`;
  }

  static getHarborTableName(): string {
    return `Harbor-${Config.getEnvironment()}`;
  }

  private static errorMessage(variable: string): string {
    return `Environment variable ${variable} missing, run '. ${__dirname}/../bin/setenv.sh' to set it`;
  }

  public getStringParameter(parameterName: string): string {
    return ssm.StringParameter.valueForStringParameter(this.scope, `/${Config.getEnvironment()}/${parameterName}`);
  }

  public getGlobalStringParameter(parameterName: string): string {
    return ssm.StringParameter.valueForStringParameter(this.scope, `/${parameterName}`);
  }

  public saveStringParameter(parameterName: string, stringValue: string): string {
    const param = new ssm.StringParameter(this.scope, 'DVKStringParameter', {
      parameterName,
      stringValue,
    });

    return param.parameterArn;
  }
}

export default Config;
