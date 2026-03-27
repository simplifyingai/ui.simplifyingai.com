#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { SimplifyChartsStack } from "./simplify-charts-stack";

const app = new cdk.App();

new SimplifyChartsStack(app, "SimplifyChartsStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || "865258959338",
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
  domainName: "ui.simplifyingai.com",
  hostedZoneId: "Z081383029V3UCD2V9YZB",
  hostedZoneName: "simplifyingai.com",
});

app.synth();
