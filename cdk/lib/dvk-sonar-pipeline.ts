import {
  BuildEnvironmentVariableType,
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
      webhookFilters: [FilterGroup.inEventOf(EventAction.PUSH).andBranchIs('main')],
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
              'npm run test -- --coverage --reporters=jest-sonar',
              'cd squat && npm ci',
              'npm run lint',
              'npm run test -- --coverage --reporters=jest-sonar',
              'cd ..',
              'cd admin && npm ci',
              'npm run lint',
              'npm run test -- --coverage --reporters=jest-sonar',
              'cd ..',
              'export DVK_VERSION=`node -p "require(\'./package.json\').version"`',
              'sed -i "s/file path=\\"/file path=\\"squat\\//g" squat/coverage/sonar-report.xml',
              'sed -i "s/file path=\\"/file path=\\"admin\\//g" admin/coverage/sonar-report.xml',
              `npx sonarqube-scanner -Dsonar.host.url=$SONARQUBE_HOST_URL -Dsonar.login=$SONARQUBE_ACCESS_TOKEN -Dsonar.projectKey=DVK-main -Dsonar.projectVersion=$DVK_VERSION`,
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
          SONARQUBE_ACCESS_TOKEN: {
            type: BuildEnvironmentVariableType.SECRETS_MANAGER,
            value: 'SonarQubeAccessToken',
          },
        },
      },
      grantReportGroupPermissions: true,
      badge: true,
    });
  }
}
