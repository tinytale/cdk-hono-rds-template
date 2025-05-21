local cfn_output = std.native('cfn_output');
local stack_name = 'DebugStack';

{
  desiredCount: 0,
  capacityProviderStrategy: [
    { capacityProvider: 'FARGATE_SPOT', weight: 1 },
  ],
  enableExecuteCommand: true,
  networkConfiguration: {
    awsvpcConfiguration: {
      subnets: [
        cfn_output(stack_name, 'PrivateSubnet1'),
        cfn_output(stack_name, 'PrivateSubnet2'),
      ],
      securityGroups: [
        cfn_output(stack_name, 'JumpBoxSecurityGroupId'),
      ],
    },
  },
}
