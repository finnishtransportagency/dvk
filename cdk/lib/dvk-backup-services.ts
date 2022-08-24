import { Duration } from 'aws-cdk-lib';
import { BackupPlanRuleProps } from 'aws-cdk-lib/aws-backup';
import { Construct } from 'constructs';
import Config from './config';
import * as backup from 'aws-cdk-lib/aws-backup';
import * as events from 'aws-cdk-lib/aws-events';

export class BackupServices extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const backupPlanName = 'Plan-' + Config.getEnvironment();
    const backupVaultName = 'Vault-' + Config.getEnvironment();

    let backupPlanRuleProps: BackupPlanRuleProps;
    if (Config.isProductionEnvironment()) {
      backupPlanRuleProps = {
        moveToColdStorageAfter: Duration.days(35),
        deleteAfter: Duration.days(365),
        enableContinuousBackup: true,
      };
    } else {
      backupPlanRuleProps = {
        deleteAfter: Duration.days(35),
        enableContinuousBackup: true,
      };
    }

    const plan = new backup.BackupPlan(this, backupPlanName, {
      backupPlanName,
      backupVault: new backup.BackupVault(this, backupVaultName, { backupVaultName }),
      backupPlanRules: [
        new backup.BackupPlanRule({
          ...backupPlanRuleProps,
          ruleName: 'Daily',
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

    const backupSelection = plan.addSelection('DvkBackupSelection', {
      allowRestores: true,
      resources: [
        backup.BackupResource.fromTag('Project', 'dvk'),
        backup.BackupResource.fromTag('Environment', Config.getEnvironment()),
        backup.BackupResource.fromTag('Backups', 'true'),
      ],
    });
  }
}
