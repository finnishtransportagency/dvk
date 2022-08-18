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
              'cd cdk && npm ci && npm run generate && cd ..',
              'npm run lint',
              'npm run test -- --coverage --reporters=jest-junit',
              'cd squat && npm ci && cd cdk && npm ci && cd ..',
              'npm run lint',
              'npm run test -- --coverage --reporters=jest-junit',
              'npm run build',
              'npx serve -s build &',
              'until curl -s http://localhost:3000 > /dev/null; do sleep 1; done',
              'cd ../test',
              'pip3 install --user --no-cache-dir -r requirements.txt',
              'xvfb-run --server-args="-screen 0 1920x1080x24 -ac" robot -v BROWSER:chrome --outputdir report --xunit xunit.xml .',
            ],
          },
        },
        cache: { paths: ['/opt/robotframework/temp/.npm/**/*'] },
        reports: {
          'dvk-tests': { files: 'junit.xml' },
          'dvk-coverage': { files: 'coverage/clover.xml', 'file-format': 'CLOVERXML' },
          'squat-tests': { files: 'squat/junit.xml' },
          'squat-coverage': { files: 'squat/coverage/clover.xml', 'file-format': 'CLOVERXML' },
          'robot-tests': { files: 'test/report/xunit.xml' },
        },
        artifacts: { files: 'test/report/**/*', 'discard-paths': 'yes', name: 'report/robot/$CODEBUILD_BUILD_NUMBER' },
      }),
      source: gitHubSource,
      cache: Cache.local(LocalCacheMode.CUSTOM, LocalCacheMode.SOURCE, LocalCacheMode.DOCKER_LAYER),
      environment: {
        buildImage: LinuxBuildImage.fromEcrRepository(Repository.fromRepositoryName(this, 'DvkRobotImage', 'dvk-robotimage'), '1.0.0'),
        privileged: true,
        computeType: ComputeType.MEDIUM,
        environmentVariables: {
          CI: { value: true },
        },
      },
      grantReportGroupPermissions: true,
      badge: true,
    });
  }
}
