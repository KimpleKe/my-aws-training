# Activities

### Setup

`authenticate` to the REA Training account using the `REA-Training-Administrator` role
  * If you do not have this role, please put your LDAP name in `#aws-training` and I'll add you

Generate a new SSH key and import it to the training account

NOTE: `ssh-keygen` will ask you for a passphrase to protect the RSA private key, it is strongly suggested to set one!

```
export NAME=YOURNAME-$(date +%s)
ssh-keygen -t rsa -b 4096 -f $NAME
```

Import the public key to AWS

```
aws ec2 import-key-pair --key-name $NAME --public-key-material file://$NAME.pub
```

Deploy the stack (create time takes ~5 mins)

```
aws cloudformation create-stack \
    --stack-name least-priv-$NAME \
    --template-body file://least-priv.json \
    --parameters ParameterKey=KeyName,ParameterValue=$NAME \
    --capabilities CAPABILITY_IAM
```

This stack will create two EC2 instances that have some interesting properties

Examine your stack to see what you have

`aws cloudformation describe-stack-resources --stack-name least-priv-$NAME`

```
{
    "StackResources": [
        {
            "StackId": "arn:aws:cloudformation:ap-southeast-2:561534074837:stack/least-priv-dkw-1496385028/fff72600-475c-11e7-9a83-503f237b780a",
            "ResourceStatus": "CREATE_COMPLETE",
            "ResourceType": "AWS::EC2::Instance",
            "Timestamp": "2017-06-02T06:33:32.505Z",
            "StackName": "least-priv-dkw-1496385028",
            "PhysicalResourceId": "i-069dbefd6950f4616",
            "LogicalResourceId": "InstanceA"
        },
        {
            "StackId": "arn:aws:cloudformation:ap-southeast-2:561534074837:stack/least-priv-dkw-1496385028/fff72600-475c-11e7-9a83-503f237b780a",
            "ResourceStatus": "CREATE_COMPLETE",
            "ResourceType": "AWS::EC2::Instance",
            "Timestamp": "2017-06-02T06:33:32.975Z",
            "StackName": "least-priv-dkw-1496385028",
            "PhysicalResourceId": "i-092c50e9412ee0f4a",
            "LogicalResourceId": "InstanceB"
        },
        {
            "StackId": "arn:aws:cloudformation:ap-southeast-2:561534074837:stack/least-priv-dkw-1496385028/fff72600-475c-11e7-9a83-503f237b780a",
            "ResourceStatus": "CREATE_COMPLETE",
            "ResourceType": "AWS::IAM::InstanceProfile",
            "Timestamp": "2017-06-02T06:33:08.051Z",
            "StackName": "least-priv-dkw-1496385028",
            "PhysicalResourceId": "least-priv-dkw-1496385028-InstanceProfile-J1HFQ8VVT610",
            "LogicalResourceId": "InstanceProfile"
        },
        {
            "StackId": "arn:aws:cloudformation:ap-southeast-2:561534074837:stack/least-priv-dkw-1496385028/fff72600-475c-11e7-9a83-503f237b780a",
            "ResourceStatus": "CREATE_COMPLETE",
            "ResourceType": "AWS::IAM::Role",
            "Timestamp": "2017-06-02T06:31:03.836Z",
            "StackName": "least-priv-dkw-1496385028",
            "PhysicalResourceId": "least-priv-dkw-1496385028-Role-1LE5VT7RSAB6N",
            "LogicalResourceId": "Role"
        },
        {
            "StackId": "arn:aws:cloudformation:ap-southeast-2:561534074837:stack/least-priv-dkw-1496385028/fff72600-475c-11e7-9a83-503f237b780a",
            "ResourceStatus": "CREATE_COMPLETE",
            "ResourceType": "AWS::EC2::SecurityGroup",
            "Timestamp": "2017-06-02T06:30:48.527Z",
            "StackName": "least-priv-dkw-1496385028",
            "PhysicalResourceId": "sg-fafca59d",
            "LogicalResourceId": "SecurityGroupA"
        },
        {
            "StackId": "arn:aws:cloudformation:ap-southeast-2:561534074837:stack/least-priv-dkw-1496385028/fff72600-475c-11e7-9a83-503f237b780a",
            "ResourceStatus": "CREATE_COMPLETE",
            "ResourceType": "AWS::EC2::SecurityGroup",
            "Timestamp": "2017-06-02T06:30:48.735Z",
            "StackName": "least-priv-dkw-1496385028",
            "PhysicalResourceId": "sg-77fda410",
            "LogicalResourceId": "SecurityGroupB"
        }
    ]
}
```

Check the outputs of your stack to find your two public hostnames

`aws cloudformation describe-stacks --stack-name least-priv-$NAME --query Stacks[].Outputs[]`

```
[
    {
        "Description": "The public DNS name assigned to the A instance",
        "OutputKey": "InstanceA",
        "OutputValue": "ec2-13-55-19-150.ap-southeast-2.compute.amazonaws.com"
    },
    {
        "Description": "The public DNS name assigned to the B instance",
        "OutputKey": "InstanceB",
        "OutputValue": "ec2-54-153-219-55.ap-southeast-2.compute.amazonaws.com"
    }
]
```

Try and ssh into both instances using your key

```
ssh -i $NAME ec2-user@HOSTNAME
```

### Note on the Activities

All tasks should be done by updating the Cloudformation, this the correct way to make changes and is also a chance to practise more :)

### IAM Policy Hardening

Examine the Cloudformation stack and resulting resources

You'll see these instances have an IAM policy granting **all** permissions to every S3 bucket in this account

Consider the implications of this if an attacker is able to compromise the instance...

* There is a bucket in this account called `s3://rea-aws-training-least-priv`
* These EC2 instances should only be able to read the file `EC2.txt` from this Bucket
* No other permissions are required

Update the stack to make this security change then think about how you might test this...

### Locking down the Security Groups for inbound traffic

Examine the Security Group for Instance B, you'll see it allows any IP address (10.0.0.0/8) from the VPC to SSH in

Consider the implications of this...

We want it to be configured so only Instance A may SSH in

Consider how you might approach this, start by reading some docs https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ec2-security-group-ingress.html

Update the stack to make this security change then think about how you might test it...

### Locking down the Security Groups for outbound traffic

Who ever considers outbound traffic when setting up a firewall?

Did you know, when you create a Security Group in AWS, if you don't explicitly specify outbound rules, **everything** is allowed out by default!

Is this wise...?

One nice way to restrict this behaviour is by creating an outbound rulle that allows traffic to localhost (`127.0.0.1`) for each group you make.

Traffic to localhost never exits the machine, so this rule is effectively a no-op (does nothing), but it will prevent the default "allow all" rule from being created.

You will then be able to create an additional group that explicitly permits only the desired outbound traffic.

Here is an example of a group that allows SSH in and will also not create the outbound "allow all" rule (uses the above method to achieve this):

```
"ssh": {
    "Type": "AWS::EC2::SecurityGroup",
    "Properties": {
        "GroupDescription": "Allow SSH",
        "VpcId": { "Ref": "VpcId" },
        "SecurityGroupIngress": [
            {
                "IpProtocol": "tcp",
                "FromPort": "22",
                "ToPort": "22",
                "CidrIp": "TRUSTEDORIGIN/32"
            }
        ],
        "SecurityGroupEgress": [
            {
                "IpProtocol": "-1",
                "FromPort": "-1",
                "ToPort": "-1",
                "CidrIp": "127.0.0.1/32"
            }
        ]
    }
}
```

Have a play with this, try and lock down one of the instances to only allow the following traffic outbound:

* 22/TCP - SSH
* 53/UDP - DNS
* 123/UDP - NTP
* 80/TCP - HTTP
* 443/TCP - HTTPS

How could you test what you have done?

* One approach might be to try and ping google.com (since you have not permitted ICMP out, ping will not work)
  * WARNING: Not allowing ICMP out may break certain things!

NOTE: Remember that Security Groups are stateful, this means that any replys to permitted inbound traffic are automatically allowed back out.
You only need to create explicit outbound rules for traffic that is initiated by the instance to some other network (eg: the VPC, the wider internet)

### Tiered VPCs

Observe the `aws-training-least-priv-vpc` VPC that is deployed in this account, why do you think there are "private" subnets?

1. Manually create an EC2 instance in one of the "private" subnets and assign it a public IP address
2. Try and SSH in
3. Did it work (why/why not)?

### Extension Work (for after the training or if you finish early)

Consider how you could use CloudTrail and the AWS Policy Builder to create a minimal Policy that is capable of deploying the `least-priv.json` stack

Try and do it...

### Cleanup

Delete your stack

```
aws cloudformation delete-stack --stack-name least-priv-$NAME
```
