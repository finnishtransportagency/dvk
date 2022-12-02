import { Construct } from 'constructs';
import { FilterPattern, LogGroup, MetricFilter } from 'aws-cdk-lib/aws-logs';
import { Alarm, ComparisonOperator, GraphWidget, Metric, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch';
import lambdaFunctions from './lambda/graphql/lambdaFunctions';
import { Duration, aws_cloudwatch as cloudwatch } from 'aws-cdk-lib';
import { Subscription, SubscriptionProtocol, Topic } from 'aws-cdk-lib/aws-sns';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import Config from './config';

type DvkMetric = { name: string; statistics: string };
export class MonitoringServices extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    const env = Config.getEnvironment();

    // create topic and subscription for alarms
    const topic = new Topic(this, 'DvkAlarmsTopic', {
      topicName: `DvkAlarmsTopic_${env}`,
    });

    new Subscription(this, 'DvkAlarmSubscription', {
      topic,
      endpoint: 'juhani.kettunen@cgi.com', //TODO: change to support email
      protocol: SubscriptionProtocol.EMAIL,
    });
    const action = new SnsAction(topic);

    // create log group filters for lambda logs and create alarms for filters
    for (const lambdaFunc of lambdaFunctions) {
      const functionName = this.getLambdaName(lambdaFunc.typeName, lambdaFunc.fieldName, env);
      const metricFilter = this.createLogGroupMetricFilter(functionName, env);
      const logAlarm = this.createAlarmForMetric(metricFilter.metric(), env);
      logAlarm.addAlarmAction(action);
    }

    // create general alarms for lambdas...
    const lambdaAlarms = this.createAlarmForMetric(this.createLambdaMetric(env, 'Errors', 'Sum'), env);
    lambdaAlarms.addAlarmAction(action);

    // ...cloudfront
    // TODO: Cannot create an Alarm in region 'eu-west-1' based on metric '5xxErrorRate' in 'us-east-1'
    // needs own stack with us-east-1 if no other workarounds
    // const cloudFrontAlarm = this.createAlarmForMetric(this.createCloudFrontMetric(env, '5xxErrorRate', 'Max'), env);
    // cloudFrontAlarm.addAlarmAction(action);

    // ... and appsync
    const appSyncAlarm = this.createAlarmForMetric(this.createAppSyncMetric(env, '5xxErrorRate', 'Max'), env);
    appSyncAlarm.addAlarmAction(action);

    // dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'DvkDashboard', {
      dashboardName: 'DvkDashboard' + env,
      end: 'end',
      periodOverride: cloudwatch.PeriodOverride.AUTO,
      start: 'start',
    });
    // create cloudfront widgets
    const cwMetrics: DvkMetric[] = [
      { name: 'Requests', statistics: 'Sum' },
      { name: 'BytesDownloaded', statistics: 'Sum' },
      { name: '4xxErrorRate', statistics: 'Sum' },
      { name: '5xxErrorRate', statistics: 'Sum' },
    ];
    const cwWidgets = cwMetrics.map((metric) => this.createCloudFrontWidget(env, metric.name, metric.statistics));
    dashboard.addWidgets(...cwWidgets);

    // create error log widget
    const logGroupNames = lambdaFunctions.map((lambda) => `/aws/lambda/${this.getLambdaName(lambda.typeName, lambda.fieldName, env)}`);

    dashboard.addWidgets(
      new cloudwatch.LogQueryWidget({
        logGroupNames: logGroupNames,
        view: cloudwatch.LogQueryVisualizationType.TABLE,
        // The lines will be automatically combined using '\n|'.
        queryLines: [
          'fields @timestamp, @message',
          'filter @message like /ERROR/ or level like /error/ or level like /fatal/',
          'sort @timestamp desc',
          'limit 50',
        ],
      })
    );

    // create lambda widget
    // TODO: Might change to an explorer type widget with tag selection (project: dvk, env: prod), when supported by cdk
    const lambdaMetrics: DvkMetric[] = [
      { name: 'Invocations', statistics: 'Sum' },
      { name: 'Errors', statistics: 'Sum' },
      { name: 'Duration', statistics: 'Sum' },
    ];
    const lambdaWidgets = lambdaMetrics.map((metric) => this.createLambdaWidget(env, metric.name, metric.statistics));
    dashboard.addWidgets(...lambdaWidgets);

    // create appsync widgets
    const appsyncMetrics: DvkMetric[] = [
      // { name: 'Requests', statistics: 'Sample count' }, // throws error, which might be a cdk bug: "dataPath": "/widgets/8/properties/metrics/0", "message": "Should NOT have more than 4 items"
      { name: '4xxErrorRate', statistics: 'Sum' },
      { name: '5xxErrorRate', statistics: 'Sum' },
    ];
    const appsyncWidgets = appsyncMetrics.map((metric) => this.createAppSyncWidget(env, metric.name, metric.statistics));
    dashboard.addWidgets(...appsyncWidgets);
  }

  getLambdaName(typeName: string, fieldName: string, env: string) {
    return `${typeName}-${fieldName}-${env}`.toLocaleLowerCase();
  }

  createLogGroupMetricFilter(lambdaName: string, env: string): MetricFilter {
    const filterPattern = FilterPattern.any(FilterPattern.stringValue('$.level', '=', 'error'), FilterPattern.stringValue('$.level', '=', 'fatal'));
    const logGroupName = '/aws/lambda/' + lambdaName;
    const metricName = lambdaName + `_metric_${env}`;
    const logGroup = LogGroup.fromLogGroupName(this, 'DvkLogGroup_' + lambdaName, logGroupName);
    const metricFilter = new MetricFilter(this, `MetricFilter_${lambdaName}`, {
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
      alarmName: 'Dvk_' + metric.namespace.split('/').pop() + metric.metricName + `_alarm_${env}`,
      actionsEnabled: true,
      treatMissingData: TreatMissingData.MISSING,
    });

    return alarm;
  }

  createCloudFrontMetric(env: string, metricName: string, statistic: string) {
    const metric = new Metric({
      namespace: 'AWS/CloudFront',
      metricName: metricName,
      dimensionsMap: { DistributionId: 'E2GP14WC00IGAB', Region: 'Global' }, //TODO: get distribution id from stack outputs
      statistic: statistic,
      period: Duration.seconds(300),
      region: 'us-east-1',
    });

    return metric;
  }

  createCloudFrontWidget(env: string, metricName: string, statistic: string): GraphWidget {
    const metric = this.createCloudFrontMetric(env, metricName, statistic);

    return new GraphWidget({
      title: `CF ${metricName} ${env}`,
      left: [metric],
    });
  }

  createLambdaMetric(env: string, metricName: string, statistic: string) {
    const metric = new Metric({
      namespace: 'AWS/Lambda',
      metricName: metricName,
      statistic: statistic,
      period: Duration.seconds(300),
    });

    return metric;
  }

  createLambdaWidget(env: string, metricName: string, statistic: string) {
    const metric = this.createLambdaMetric(env, metricName, statistic);

    return new GraphWidget({
      title: `Lambda ${metricName} ${env}`,
      left: [metric],
    });
  }

  createAppSyncMetric(env: string, metricName: string, statistic: string) {
    const metric = new Metric({
      namespace: 'AWS/AppSync',
      metricName: metricName,
      dimensionsMap: { GraphQLAPIId: 'dw2qzecu7jglvhofutllu7hal4' }, //TODO get id from stack outputs or smth
      statistic: statistic,
      period: Duration.seconds(300),
    });

    return metric;
  }

  createAppSyncWidget(env: string, metricName: string, statistic: string) {
    const metric = this.createAppSyncMetric(env, metricName, statistic);

    return new GraphWidget({
      title: `AppSync ${metricName} ${env}`,
      left: [metric],
    });
  }
}
