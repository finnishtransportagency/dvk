import { Construct } from 'constructs';
import { FilterPattern, LogGroup, MetricFilter } from 'aws-cdk-lib/aws-logs';
import { Alarm, ComparisonOperator, GraphWidget, Metric, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch';
import lambdaFunctions from './lambda/graphql/lambdaFunctions';
import apiLambdaFunctions from './lambda/api/apiLambdaFunctions';
import { Duration, aws_cloudwatch as cloudwatch } from 'aws-cdk-lib';
import { Topic } from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
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

    topic.addSubscription(new subscriptions.EmailSubscription('FI.SM.GEN.DVK@cgi.com')); //'FI.SM.GEN.DVK@cgi.com'

    const action = new SnsAction(topic);

    // create log group filters for (graphql) lambda logs and create alarms for filters
    for (const lambdaFunc of lambdaFunctions) {
      const functionName = this.getLambdaName(lambdaFunc.typeName, lambdaFunc.fieldName, env);
      const metricFilter = this.createLogGroupMetricFilter(functionName, env);
      const logAlarm = this.createAlarmForMetric(
        metricFilter.metric(),
        env,
        `Alert: GraphQL Handler ${functionName} errors have exceeded the threshold in the ' + env + ' environment.`
      );
      logAlarm.addAlarmAction(action);
    }
    // ... and api functions
    for (const lambdaFunc of apiLambdaFunctions) {
      if (lambdaFunc.useMonitoring) {
        const functionName = `${lambdaFunc.functionName}-${env}`.toLocaleLowerCase();
        const metricFilter = this.createLogGroupMetricFilter(functionName, env);
        const logAlarm = this.createAlarmForMetric(
          metricFilter.metric({ statistic: 'Sum' }),
          env,
          `Alert: API Lambda ${functionName} errors have exceeded the threshold in the ' + env + ' environment.`
        );
        logAlarm.addAlarmAction(action);
      }
    }

    // create general alarms for lambdas...
    const lambdaAlarms = this.createAlarmForMetric(
      this.createLambdaMetric(env, 'Errors', 'Sum'),
      env,
      'Alert: General Lambda Errors have exceeded the threshold in the ' + env + ' environment.'
    );
    lambdaAlarms.addAlarmAction(action);

    // ... and appsync
    const appSyncAlarm = this.createAlarmForMetric(
      this.createAppSyncMetric(env, '5XXError', 'Max'),
      env,
      'Alert: AppSync 5XX Errors have exceeded the threshold in the ' + env + ' environment.'
    );
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
      { name: '4xxErrorRate', statistics: 'Average' },
      { name: '5xxErrorRate', statistics: 'Average' },
    ];
    const cwWidgets = cwMetrics.map((metric) => this.createCloudFrontWidget(env, metric.name, metric.statistics));
    dashboard.addWidgets(...cwWidgets);

    // create error log widget
    const logGroupNames = lambdaFunctions.map((lambda) => `/dvk/lambda/${this.getLambdaName(lambda.typeName, lambda.fieldName, env)}`);
    const apiLogGroupNames: string[] = [];
    apiLambdaFunctions.forEach((lambda) => {
      if (lambda.useMonitoring) apiLogGroupNames.push(`/dvk/lambda/${lambda.functionName}-${env}`.toLocaleLowerCase());
    });

    dashboard.addWidgets(
      new cloudwatch.LogQueryWidget({
        title: 'All errors',
        logGroupNames: logGroupNames.concat(apiLogGroupNames),
        view: cloudwatch.LogQueryVisualizationType.TABLE,
        queryLines: [
          'fields @timestamp, @message',
          'filter @message like /ERROR/ or level like /error/ or level like /fatal/',
          'sort @timestamp desc',
          'limit 50',
        ],
      }),
      // APIs all lines
      new cloudwatch.LogQueryWidget({
        title: 'APIs all lines',
        logGroupNames: apiLogGroupNames,
        view: cloudwatch.LogQueryVisualizationType.TABLE,
        queryLines: ['fields @timestamp, @message', 'filter tag = "DVK_BACKEND"', 'sort @timestamp desc', 'limit 50'],
      })
    );
    // Log widget with error counts for APIs
    dashboard.addWidgets(
      new cloudwatch.LogQueryWidget({
        title: 'APIs error counts',
        logGroupNames: apiLogGroupNames,
        view: cloudwatch.LogQueryVisualizationType.TABLE,
        queryLines: [
          `fields Lukumaara, msg`,
          ` filter tag = "DVK_BACKEND" and @message like /(\\w+) api fetch failed/`,
          ` fields substr(msg, 0, 150) as short_msg`,
          ` stats count(*) as Lukumaara by short_msg`,
          ` sort Lukumaara desc`,
          ` display Lukumaara, short_msg`,
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
      // { name: 'Requests', statistics: 'Sample count' }, // TODO: throws error, which might be a cdk bug: "dataPath": "/widgets/8/properties/metrics/0", "message": "Should NOT have more than 4 items"
      { name: '4XXError', statistics: 'Sum' },
      { name: '5XXError', statistics: 'Sum' },
    ];
    const appsyncWidgets = appsyncMetrics.map((metric) => this.createAppSyncWidget(env, metric.name, metric.statistics));
    dashboard.addWidgets(...appsyncWidgets);
  }

  getLambdaName(typeName: string, fieldName: string, env: string) {
    return `${typeName}-${fieldName}-${env}`.toLocaleLowerCase();
  }

  createLogGroupMetricFilter(lambdaName: string, env: string): MetricFilter {
    const filterPattern = FilterPattern.any(
      FilterPattern.stringValue('$.level', '=', 'error'),
      FilterPattern.stringValue('$.level', '=', 'fatal'),
      FilterPattern.stringValue('$.message', '=', 'ERROR'),
      FilterPattern.stringValue('$.message', '=', 'Error'),
      FilterPattern.stringValue('$.message', '=', 'error'),
      FilterPattern.stringValue('$.message', '=', 'FATAL'),
      FilterPattern.stringValue('$.message', '=', 'Fatal'),
      FilterPattern.stringValue('$.message', '=', 'fatal')
    );
    const logGroupName = '/dvk/lambda/' + lambdaName;
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

  createAlarmForMetric(metric: Metric, env: string, customMessage?: string): Alarm {
    const defaultMessage = `Alert: ${metric.metricName} has exceeded the threshold of 1 in the ${env} environment.`;

    const alarm = new Alarm(this, 'DvkErrors-' + metric.metricName, {
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: 1,
      datapointsToAlarm: 1,
      evaluationPeriods: 1,
      metric,
      alarmName: 'Dvk_' + metric.namespace.split('/').pop() + metric.metricName + `_alarm_${env}`,
      actionsEnabled: true,
      treatMissingData: TreatMissingData.MISSING,
      alarmDescription: customMessage || defaultMessage,
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

  createAppSyncMetric(env: string, metricName: string, statistic?: string) {
    const metric = new Metric({
      namespace: 'AWS/AppSync',
      metricName: metricName,
      dimensionsMap: { GraphQLAPIId: 'dw2qzecu7jglvhofutllu7hal4' }, //TODO get id from stack outputs or smth
      period: Duration.seconds(300),
      statistic,
    });

    return metric;
  }

  createAppSyncWidget(env: string, metricName: string, statistic: string) {
    const metric = this.createAppSyncMetric(env, metricName);

    return new GraphWidget({
      title: `AppSync ${metricName} ${env}`,
      left: [metric],
      statistic,
    });
  }
}
