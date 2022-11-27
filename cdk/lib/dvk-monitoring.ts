import { Construct } from 'constructs';
import { FilterPattern, LogGroup, MetricFilter } from 'aws-cdk-lib/aws-logs';
import { Alarm, ComparisonOperator, Metric } from 'aws-cdk-lib/aws-cloudwatch';

export class MonitoringServices extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    console.log('placeholder');
    //TODO: create log group filters
    //TODO: create alarms for filters
    //TODO: create alarms for lambdas, cloudfront and appsync

    //TODO: create cloudwatch dashboard
    //TODO: create lambda widgets
    //TODO: create cloudfront widgets
    //TODO: create appsync widgets
    //TODO: create error log widget
  }

  createLogGroupMetricFilter(lambdaName: string): MetricFilter {
    const filterPattern = FilterPattern.anyTerm('{($.level = "error") || ($.level = "fatal")}');
    const logGroupName = '/aws/lambda/' + lambdaName;
    const metricName = lambdaName + '-metric';
    const logGroup = LogGroup.fromLogGroupName(this, 'DvkLogGroup-' + lambdaName, logGroupName);
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

  createAlarmForMetric(metric: Metric) {
    const alarm = new Alarm(this, 'DvkErrors-' + metric.metricName, {
      comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
      threshold: 1,
      evaluationPeriods: 1,
      metric,
    });

    return alarm;
  }
}
