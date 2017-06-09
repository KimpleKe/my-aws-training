REA AWS Tools
=============

## CLI tools
- [awscli](https://github.com/aws/aws-cli)
- [bash-my-aws](https://github.com/realestate-com-au/bash-my-aws) 
- [bash-my-rea](https://git.realestate.com.au/mbailey/bash-my-rea)
- [stackup](https://github.com/realestate-com-au/stackup)


## demo: AWSCLI

- make sure you have bash-completion enabled

```
aws ec2 describe-instances
aws ec2 describe-instances | less
aws ec2 describe-instances --output text
aws ec2 describe-instances --output table
aws ec2 describe-instances --query "Reservations[].Instances[].InstanceId'
aws ec2 describe-instances --query "Reservations[].Instances[].[InstanceId,VpcId]"
aws ec2 describe-instances --query "Reservations[].Instances[].[InstanceId,VpcId]" --output text
```

[jmespath](http://jmespath.org/)


## demo: bash-my-aws
- zsh uses should prepend each bash-my-aws function call with `bma`

```
instances
instances | instance-ip
instances | instance-stack

stacks
STACK=$(stacks | head -1) 
stack-template $STACK > $STACK.json 
stack-parameters $STACK > $STACK-params.json 
stack-diff $STACK 
# edit $STACK.json and change a value
stack-diff $STACK 
stack-update $STACK

stack-delete $STACK
# edit $STACK.json to break it
stack-create $STACK
CTRL-C
stack-tail $STACK
stack-failure

asgs
elbs
vpcs
```

## demo: bash-my-rea

```
resi-mgmt-Auditor
rsc-aws-accounts
rsc-aws-accounts | grep resi_lob
rsc-aws-accounts | grep resi_lob | aws-panopticon vpcs
```
