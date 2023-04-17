import { Duration } from 'aws-cdk-lib';
import { BackupPlanRuleProps } from 'aws-cdk-lib/aws-backup';
import { Construct } from 'constructs';
import Config from './config';
import * as backup from 'aws-cdk-lib/aws-backup';
import * as events from 'aws-cdk-lib/aws-events';
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export class BackupServices extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    let backupPlanRuleProps: BackupPlanRuleProps;
    // Kaikille yhteinen PITR/jatkuva varmistus
    // Huom DynamoDB PITR pitaa toistaiseksi laittaa paalle erikseen Dynamon puolelta
    backupPlanRuleProps = {
      ruleName: 'ContinuousRule-' + Config.getEnvironment(),
      deleteAfter: Duration.days(35),
      enableContinuousBackup: true,
    };
    this.addPlan('ContinuousPlan-' + Config.getEnvironment(), 'Vault-' + Config.getEnvironment(), backupPlanRuleProps);

    // Tuotannolle lisaksi pitkan sailytyksen paivittainen varmistus
    if (Config.isProductionEnvironment()) {
      backupPlanRuleProps = {
        ruleName: 'LongStorageRule-' + Config.getEnvironment(),
        moveToColdStorageAfter: Duration.days(35),
        deleteAfter: Duration.days(365),
      };
      this.addPlan('LongStoragePlan-prod', 'Vault-Long-prod', backupPlanRuleProps);
    }
  }

  private addPlan(backupPlanName: string, backupVaultName: string, props: BackupPlanRuleProps) {
    const plan = new backup.BackupPlan(this, backupPlanName, {
      backupPlanName,
      backupVault: new backup.BackupVault(this, backupVaultName, { backupVaultName }),
      backupPlanRules: [
        new backup.BackupPlanRule({
          ...props,
          startWindow: Duration.hours(1),
          completionWindow: Duration.hours(2),
          scheduleExpression: events.Schedule.cron({
            minute: '0',
            hour: '5',
            day: '*',
            month: '*',
            year: '*',
          }),
        }),
      ],
    });

    const backupPlanRole = new Role(this, 'BackupRole' + Config.getEnvironment(), {
      assumedBy: new ServicePrincipal('backup.amazonaws.com'),
    });
    backupPlanRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSBackupServiceRolePolicyForS3Restore'));

    plan.addSelection('DvkBackupSelection' + Config.getEnvironment(), {
      allowRestores: true,
      resources: [backup.BackupResource.fromTag('Backups-' + Config.getEnvironment(), 'true')],
      role: backupPlanRole,
    });

    backupPlanRole.addToPrincipalPolicy(
      new PolicyStatement({
        sid: 'S3BucketBackupPermissions',
        actions: [
          's3:GetInventoryConfiguration',
          's3:PutInventoryConfiguration',
          's3:ListBucketVersions',
          's3:ListBucket',
          's3:GetBucketVersioning',
          's3:GetBucketNotification',
          's3:PutBucketNotification',
          's3:GetBucketLocation',
          's3:GetBucketTagging',
        ],
        effect: Effect.ALLOW,
        resources: ['arn:aws:s3:::*'],
      })
    );
    backupPlanRole.addToPrincipalPolicy(
      new PolicyStatement({
        sid: 'S3ObjectBackupPermissions',
        actions: [
          's3:GetObjectAcl',
          's3:GetObject',
          's3:GetObjectVersionTagging',
          's3:GetObjectVersionAcl',
          's3:GetObjectTagging',
          's3:GetObjectVersion',
        ],
        effect: Effect.ALLOW,
        resources: ['arn:aws:s3:::*/*'],
      })
    );
    backupPlanRole.addToPrincipalPolicy(
      new PolicyStatement({
        sid: 'S3GlobalPermissions',
        actions: ['s3:ListAllMyBuckets'],
        effect: Effect.ALLOW,
        resources: ['*'],
      })
    );
    backupPlanRole.addToPrincipalPolicy(
      new PolicyStatement({
        sid: 'KMSBackupPermissions',
        actions: ['kms:Decrypt', 'kms:DescribeKey'],
        effect: Effect.ALLOW,
        resources: ['*'],
        conditions: {
          StringLike: {
            'kms:ViaService': 's3.*.amazonaws.com',
          },
        },
      })
    );
    backupPlanRole.addToPrincipalPolicy(
      new PolicyStatement({
        sid: 'EventsPermissions',
        actions: [
          'events:DescribeRule',
          'events:EnableRule',
          'events:PutRule',
          'events:DeleteRule',
          'events:PutTargets',
          'events:RemoveTargets',
          'events:ListTargetsByRule',
          'events:DisableRule',
        ],
        effect: Effect.ALLOW,
        resources: ['arn:aws:events:*:*:rule/AwsBackupManagedRule*'],
      })
    );
    backupPlanRole.addToPrincipalPolicy(
      new PolicyStatement({
        sid: 'EventsMetricsGlobalPermissions',
        actions: ['cloudwatch:GetMetricData', 'events:ListRules'],
        effect: Effect.ALLOW,
        resources: ['*'],
      })
    );
  }
}
