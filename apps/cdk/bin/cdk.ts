#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { DebugStack } from "../lib/stack";

const app = new cdk.App();
new DebugStack(app, "DebugStack", {
  env: {
    account: "637423391958",
    region: "ap-northeast-1",
  },
});
