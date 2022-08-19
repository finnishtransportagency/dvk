import {
  Artifacts,
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
import Config from './config';

export class DvkSonarPipelineStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id, { stackName: 'DvkSonarPipelineStack' });
    const config = new Config(this);
    const sourceProps: GitHubSourceProps = {
      owner: 'finnishtransportagency',
      repo: 'dvk',
      reportBuildStatus: true,
      webhookFilters: [FilterGroup.inEventOf(EventAction.PULL_REQUEST_MERGED).andBaseBranchIs('main')],
    };
    const gitHubSource = Source.gitHub(sourceProps);
    new Project(this, 'DvkSonarQube', {
      projectName: 'DvkSonarQube',
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
              `npx sonarqube-scanner -Dsonar.host.url=${process.env.SONARQUBE_HOST_URL} -Dsonar.login=${process.env.SONARQUBE_ACCESS_TOKEN} -Dsonar.projectKey=DVK -Dsonar.projectVersion=`,
            ],
          },
        },
        cache: { paths: ['/opt/robotframework/temp/.npm/**/*', '/opt/robotframework/temp/.sonar/**/*'] },
      }),
      source: gitHubSource,
      cache: Cache.local(LocalCacheMode.CUSTOM, LocalCacheMode.SOURCE, LocalCacheMode.DOCKER_LAYER),
      environment: {
        buildImage: LinuxBuildImage.fromEcrRepository(Repository.fromRepositoryName(this, 'DvkRobotImage', 'dvk-robotimage'), '1.0.0'),
        privileged: true,
        computeType: ComputeType.MEDIUM,
        environmentVariables: {
          CI: { value: true },
          SONARQUBE_HOST_URL: { value: config.getGlobalStringParameter('SonarQubeHostURL') },
          SONARQUBE_ACCESS_TOKEN: { value: config.getGlobalStringParameter('SonarQubeAccessToken') },
        },
      },
      grantReportGroupPermissions: true,
      badge: true,
    });
  }
}
