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
    const backupPlanRole = new Role(this, 'BackupRole' + Config.getEnvironment(), {
      assumedBy: new ServicePrincipal('backup.amazonaws.com'),
    });
    backupPlanRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSBackupServiceRolePolicyForS3Restore'));
    backupPlanRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSBackupServiceRolePolicyForS3Backup'));

    let backupPlanRuleProps: BackupPlanRuleProps;
    // Kaikille yhteinen PITR/jatkuva varmistus
    // Huom DynamoDB PITR pitaa toistaiseksi laittaa paalle erikseen Dynamon puolelta
    backupPlanRuleProps = {
      ruleName: 'ContinuousRule-' + Config.getEnvironment(),
      deleteAfter: Duration.days(35),
      enableContinuousBackup: true,
    };
    const plan = this.addPlanWithNewVault(
      'ContinuousPlan-' + Config.getEnvironment(),
      'Vault-' + Config.getEnvironment(),
      backupPlanRuleProps,
      backupPlanRole
    );

    // Tuotannolle lisaksi pitkan sailytyksen paivittainen varmistus
    if (Config.isProductionEnvironment()) {
      backupPlanRuleProps = {
        ruleName: 'LongStorageRule-' + Config.getEnvironment(),
        moveToColdStorageAfter: Duration.days(35),
        deleteAfter: Duration.days(365),
      };

      this.addPlanWithNewVault('LongStoragePlan-prod', 'Vault-Long-prod', backupPlanRuleProps, backupPlanRole); // TODO: poistetaan aikanaan, kun päätetty mitä olemassa oleville varmistuksille tehdään
      this.addPlan('LongStoragePlan-new-' + Config.getEnvironment(), plan.backupVault, backupPlanRuleProps, backupPlanRole); // lisätään pitkät kopiot samaan vaultiin jatkuvan varmistuksen kanssa, koska s3-resursseja ei voida kopioida useaan eri vaulttiin
    }
  }

  private addPlan(backupPlanName: string, backupVault: backup.IBackupVault, props: BackupPlanRuleProps, backupPlanRole: Role) {
    const plan = new backup.BackupPlan(this, backupPlanName, {
      backupPlanName,
      backupVault,
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

    plan.addSelection('DvkBackupSelection' + Config.getEnvironment(), {
      allowRestores: true,
      resources: [backup.BackupResource.fromTag('Backups-' + Config.getEnvironment(), 'true')],
      role: backupPlanRole,
    });

    return plan;
  }

  private addPlanWithNewVault(backupPlanName: string, backupVaultName: string, props: BackupPlanRuleProps, backupPlanRole: Role) {
    const backupVault = new backup.BackupVault(this, backupVaultName, { backupVaultName });
    const plan = this.addPlan(backupPlanName, backupVault, props, backupPlanRole);
    return plan;
  }
}
