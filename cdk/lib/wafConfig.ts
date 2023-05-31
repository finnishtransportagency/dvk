import { GraphqlApi } from 'aws-cdk-lib/aws-appsync';
import { CfnIPSet, CfnWebACL, CfnWebACLAssociation, CfnWebACLProps } from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';
import Config from './config';

export class WafConfig extends Construct {
  constructor(scope: Construct, id: string, api: GraphqlApi, allowedAddresses: string[]) {
    super(scope, id);

    const allowedIPSet = new CfnIPSet(this, 'VaylapilviIPSet', {
      addresses: allowedAddresses,
      ipAddressVersion: 'IPV4',
      scope: 'REGIONAL',
      name: `vaylapilvi-CIDR-${Config.getEnvironment()}`,
    });

    const props: CfnWebACLProps = {
      defaultAction: { allow: {} },
      scope: 'REGIONAL',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        sampledRequestsEnabled: true,
        metricName: `DVK-${Config.getEnvironment()}`,
      },
      name: `DVK-ACL-${Config.getEnvironment()}`,
      rules: [
        {
          name: 'AllowOnlyFromVaylapilvi',
          action: { block: {} },
          priority: 1,
          statement: {
            notStatement: {
              statement: {
                ipSetReferenceStatement: { arn: allowedIPSet.attrArn },
              },
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            sampledRequestsEnabled: true,
            metricName: `DVK-${Config.getEnvironment()}-AllowOnlyFromVaylapilvi`,
          },
        },
      ],
    };
    const acl = new CfnWebACL(this, 'ACL', props);

    new CfnWebACLAssociation(this, 'APIAssoc', {
      resourceArn: api.arn,
      webAclArn: acl.attrArn,
    });
  }
}
