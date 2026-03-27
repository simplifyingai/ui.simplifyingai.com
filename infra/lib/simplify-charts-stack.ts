import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53_targets from "aws-cdk-lib/aws-route53-targets";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import * as path from "path";

interface SimplifyChartsStackProps extends cdk.StackProps {
  domainName: string;
  hostedZoneId: string;
  hostedZoneName: string;
}

export class SimplifyChartsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SimplifyChartsStackProps) {
    super(scope, id, props);

    const { domainName, hostedZoneId, hostedZoneName } = props;

    // VPC
    const vpc = new ec2.Vpc(this, "SimplifyChartsVpc", {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, "SimplifyChartsCluster", {
      vpc,
      clusterName: "simplify-charts-cluster",
      containerInsightsV2: ecs.ContainerInsights.ENHANCED,
    });

    // Route53 Hosted Zone (import existing)
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "HostedZone",
      {
        hostedZoneId,
        zoneName: hostedZoneName,
      }
    );

    // ACM Certificate
    const certificate = new acm.Certificate(this, "Certificate", {
      domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    // Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, "ALB", {
      vpc,
      internetFacing: true,
      loadBalancerName: "simplify-charts-alb",
    });

    // Docker Image from local Dockerfile
    const dockerImage = new ecr_assets.DockerImageAsset(this, "DockerImage", {
      directory: path.join(__dirname, "../../"),
      file: "apps/www/Dockerfile",
      platform: ecr_assets.Platform.LINUX_AMD64,
    });

    // ECS Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "TaskDefinition",
      {
        memoryLimitMiB: 1024,
        cpu: 512,
        runtimePlatform: {
          cpuArchitecture: ecs.CpuArchitecture.X86_64,
          operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
        },
      }
    );

    // Log Group
    const logGroup = new logs.LogGroup(this, "LogGroup", {
      logGroupName: "/ecs/simplify-charts",
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Container
    const container = taskDefinition.addContainer("SimplifyChartsContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: "simplify-charts",
        logGroup,
      }),
      environment: {
        NODE_ENV: "production",
        NEXT_PUBLIC_APP_URL: `https://${domainName}`,
      },
      portMappings: [
        {
          containerPort: 3000,
          protocol: ecs.Protocol.TCP,
        },
      ],
      healthCheck: {
        command: ["CMD-SHELL", "curl -f http://localhost:3000/ || exit 1"],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
    });

    // ECS Service
    const service = new ecs.FargateService(this, "FargateService", {
      cluster,
      taskDefinition,
      desiredCount: 1,
      serviceName: "simplify-charts-service",
      assignPublicIp: false,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      circuitBreaker: {
        enable: true,
        rollback: true,
      },
    });

    // ALB Target Group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, "TargetGroup", {
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        path: "/",
        healthyHttpCodes: "200-399",
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
    });

    // Attach service to target group
    service.attachToApplicationTargetGroup(targetGroup);

    // HTTPS Listener
    const httpsListener = alb.addListener("HttpsListener", {
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificates: [certificate],
      defaultTargetGroups: [targetGroup],
    });

    // HTTP -> HTTPS Redirect
    alb.addListener("HttpListener", {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: "HTTPS",
        port: "443",
        permanent: true,
      }),
    });

    // Route53 A Record
    new route53.ARecord(this, "AliasRecord", {
      zone: hostedZone,
      recordName: domainName,
      target: route53.RecordTarget.fromAlias(
        new route53_targets.LoadBalancerTarget(alb)
      ),
    });

    // Allow ALB to reach ECS service
    service.connections.allowFrom(alb, ec2.Port.tcp(3000));

    // Auto Scaling
    const scaling = service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 4,
    });

    scaling.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    // Outputs
    new cdk.CfnOutput(this, "LoadBalancerDNS", {
      value: alb.loadBalancerDnsName,
      description: "ALB DNS Name",
    });

    new cdk.CfnOutput(this, "SiteURL", {
      value: `https://${domainName}`,
      description: "Site URL",
    });
  }
}
