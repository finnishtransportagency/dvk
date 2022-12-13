import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import Config from './config';
import { CfnWebACL, CfnWebACLProps } from 'aws-cdk-lib/aws-wafv2';

export class DvkUsEast extends Construct {
  constructor(parent: Stack, id: string) {
    super(parent, id);

    const config = new Config(this);
    const webACL = this.createWebACL();

    // Note that even though the property is called webAclId, because we’re using AWS WAFv2, we must supply the ARN of the web ACL
    config.saveStringParameter('WebAclId' + Config.getEnvironment(), webACL.attrArn);
  }

  private createWebACL(): CfnWebACL {
    const props: CfnWebACLProps = {
      defaultAction: { allow: {} },
      scope: 'CLOUDFRONT',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        sampledRequestsEnabled: true,
        metricName: `DVK-${Config.getEnvironment()}`,
      },
      name: `DVK-CF-ACL-${Config.getEnvironment()}`,
      rules: [
        {
          name: 'RuleWithAWSManagedRules',
          priority: 0,
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesCommonRuleSet',
              excludedRules: [],
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
            metricName: `DVK-${Config.getEnvironment()}-RuleWithAWSManagedRules`,
          },
          overrideAction: {
            none: {},
          },
        },
      ],
    };
    return new CfnWebACL(this, 'ACL', props);
  }
}
