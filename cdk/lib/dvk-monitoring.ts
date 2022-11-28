import { Construct } from 'constructs';
import { FilterPattern, LogGroup, MetricFilter } from 'aws-cdk-lib/aws-logs';
import { Alarm, ComparisonOperator, Metric, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch';
import lambdaFunctions from './lambda/graphql/lambdaFunctions';
import lambda from 'aws-cdk-lib/aws-lambda';
import { Duration, aws_cloudwatch as cloudwatch } from 'aws-cdk-lib';
import { Subscription, SubscriptionProtocol, Topic } from 'aws-cdk-lib/aws-sns';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';

declare const alias: lambda.Alias;
export class MonitoringServices extends Construct {
  constructor(scope: Construct, id: string, env: string) {
    super(scope, id);
    // create topic and subscription for alarms
    const topic = new Topic(this, 'DvkAlarmsTopic', {
      topicName: `DvkAlarmsTopic_${env}`,
    });
    const subscription = new Subscription(this, 'DvkAlarmSubscription', {
      topic,
      endpoint: 'juhani.kettunen@cgi.com',
      protocol: SubscriptionProtocol.EMAIL,
    });

    // create log group filters for lambda logs and create alarms for filters
    for (const lambdaFunc of lambdaFunctions) {
      const functionName = `${lambdaFunc.typeName}-${lambdaFunc.fieldName}-${env}`.toLocaleLowerCase();
      const metricFilter = this.createLogGroupMetricFilter(functionName, env);
      this.createAlarmForMetric(metricFilter.metric(), env);
    }

    //TODO: create general alarms for lambdas...
    const lambdaAlarms = this.createAlarmForMetric(alias.metricErrors(), env);
    lambdaAlarms.addAlarmAction(new SnsAction(topic)); //TODO

    // ...cloudfront
    const cloudFrontMetric = new Metric({
      namespace: 'AWS/CloudFront',
      metricName: '5xxErrorRate',
      dimensionsMap: { DistributionId: 'E2GP14WC00IGAB', Region: 'Global' }, //TODO: get distribution id
      statistic: 'Max',
      period: Duration.seconds(60),
    });

    const cloudFrontAlarm = this.createAlarmForMetric(cloudFrontMetric, env);
    cloudFrontAlarm.addAlarmAction(new SnsAction(topic)); // TODO

    // ... and appsync
    // TODO

    // dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'DvkDashboard', {
      dashboardName: 'DvkDashboard' + env,
      end: 'end',
      periodOverride: cloudwatch.PeriodOverride.AUTO,
      start: 'start',
    });
    //TODO: create cloudfront widgets
    dashboard.addWidgets();
    //TODO: create error log widget
    dashboard.addWidgets();
    //TODO: create lambda widget
    // This was supposed to be a an explorer type widget, but it is not supported by cdk yet ->
    // have to collect all lambdas programatically
    // errors, invocations, duration
    dashboard.addWidgets();
    //TODO: create appsync widgets
    dashboard.addWidgets();
  }

  createLogGroupMetricFilter(lambdaName: string, env: string): MetricFilter {
    const filterPattern = FilterPattern.any(FilterPattern.stringValue('$.level', '=', 'error'), FilterPattern.stringValue('$.level', '=', 'fatal'));
    const logGroupName = '/aws/lambda/' + lambdaName;
    const metricName = lambdaName + `_metric_${env}`;
    const logGroup = LogGroup.fromLogGroupName(this, 'DvkLogGroup_' + lambdaName, logGroupName);
    const metricFilter = new MetricFilter(this, 'MetricFilter', {
      logGroup,
      metricNamespace: 'DVK',
      metricName,
      filterPattern,
      metricValue: '1',
      defaultValue: 0,
    });
    return metricFilter;
  }

  createAlarmForMetric(metric: Metric, env: string) {
    const alarm = new Alarm(this, 'DvkErrors-' + metric.metricName, {
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: 1,
      datapointsToAlarm: 1,
      evaluationPeriods: 1,
      metric,
      alarmName: 'Dvk_' + metric.metricName + `_alarm_${env}`,
      actionsEnabled: true,
      treatMissingData: TreatMissingData.MISSING,
    });

    return alarm;
  }

  createCloudFrontWidget(env: string, metricName: string, statistic: string) {
    // TODO
  }

  createLambdaWidget(env: string, metricName: string, statistic: string) {
    // TODO
  }

  createAppSyncWidget(env: string, metricName: string, statistic: string) {
    // TODO
  }
}
