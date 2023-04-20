import { Duration } from 'aws-cdk-lib';
import { BackupPlanRuleProps } from 'aws-cdk-lib/aws-backup';
import { Construct } from 'constructs';
import Config from './config';
import * as backup from 'aws-cdk-lib/aws-backup';
import * as events from 'aws-cdk-lib/aws-events';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

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
    backupPlanRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSBackupServiceRolePolicyForS3Backup'));
    plan.addSelection('DvkBackupSelection' + Config.getEnvironment(), {
      allowRestores: true,
      resources: [backup.BackupResource.fromTag('Backups-' + Config.getEnvironment(), 'true')],
      role: backupPlanRole,
    });
  }
}
