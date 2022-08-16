import {
  BuildSpec,
  Cache,
  ComputeType,
  EventAction,
  FilterGroup,
  GitHubSourceProps,
  LinuxBuildImage,
  LocalCacheMode,
  Project,
  Source,
} from 'aws-cdk-lib/aws-codebuild';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class DvkFeaturePipelineStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id, { stackName: 'DvkFeaturePipelineStack' });
    const sourceProps: GitHubSourceProps = {
      owner: 'finnishtransportagency',
      repo: 'dvk',
      reportBuildStatus: true,
      webhookFilters: [FilterGroup.inEventOf(EventAction.PULL_REQUEST_CREATED, EventAction.PULL_REQUEST_UPDATED)],
    };
    const gitHubSource = Source.gitHub(sourceProps);
    new Project(this, 'DvkTest', {
      projectName: 'DvkFeatureTest',
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          build: {
            commands: [
              'npm ci',
              'npm run generate',
              'npm run lint',
              'cd squat',
              'npm ci',
              'npm run lint',
              'npm run build',
              'npx serve -s build &',
              'cd ../test',
              'docker run --rm -v `pwd`:/opt/robotframework/reports:Z -v `pwd`:/opt/robotframework/tests:Z -e BROWSER=chrome --network host 012525309247.dkr.ecr.eu-west-1.amazonaws.com/dvk-robotimage:1.0.0',
            ],
          },
        },
      }),
      source: gitHubSource,
      cache: Cache.local(LocalCacheMode.CUSTOM, LocalCacheMode.SOURCE, LocalCacheMode.DOCKER_LAYER),
      environment: {
        buildImage: LinuxBuildImage.fromEcrRepository(Repository.fromRepositoryName(this, 'DvkBuildImage', 'dvk-buildimage'), '1.0.1'),
        privileged: true,
        computeType: ComputeType.MEDIUM,
      },
      grantReportGroupPermissions: true,
      badge: true,
    }).addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ecr:*', 'ssm:*', 'secretsmanager:GetSecretValue'],
        resources: ['*'],
      })
    );
  }
}
