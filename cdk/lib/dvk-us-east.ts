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
              excludedRules: [{ name: 'SizeRestrictions_BODY' }],
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
        {
          name: 'AWSManagedIPReputationList',
          priority: 10,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              name: 'AWSManagedRulesAmazonIpReputationList',
              vendorName: 'AWS',
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: `DVK-${Config.getEnvironment()}-AWSManagedIPReputationListMetric`,
            sampledRequestsEnabled: true,
          },
        },
        {
          name: 'GraphQLMutationRateLimit',
          priority: 20,
          statement: {
            rateBasedStatement: {
              limit: 50, // 50 requests per 5 minutes
              aggregateKeyType: 'IP',
              scopeDownStatement: {
                // Use scopeDownStatement to narrow the rate based limit to only apply to specific requests
                andStatement: {
                  statements: [
                    {
                      byteMatchStatement: {
                        searchString: '/graphql',
                        fieldToMatch: {
                          uriPath: {},
                        },
                        textTransformations: [{ priority: 1, type: 'NONE' }],
                        positionalConstraint: 'EXACTLY',
                      },
                    },
                    {
                      byteMatchStatement: {
                        searchString: 'mutation',
                        fieldToMatch: {
                          body: {
                            oversizeHandling: 'CONTINUE',
                          },
                        },
                        textTransformations: [{ priority: 1, type: 'NONE' }],
                        positionalConstraint: 'CONTAINS',
                      },
                    },
                  ],
                },
              },
            },
          },
          action: {
            count: {}, // testing before applying block
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: `DVK-${Config.getEnvironment()}-GraphQLMutationRateLimit`,
            sampledRequestsEnabled: true,
          },
        },
      ],
    };
    return new CfnWebACL(this, 'ACL', props);
  }
}
