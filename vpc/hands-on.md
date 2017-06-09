# REA AWS Training -- VPC hands-on

## Part 1

* Download a copy of the rea-vpc https://git.realestate.com.au/aws-infrastructure/rea-vpc/blob/master/vpc.json and deploy it (the default parameters are fine)

```
aws cloudformation create-stack \
    --stack-name YOUR-NAME-VPC  \
    --template-body file://vpc.json
```

* Create an EC2 instance (via the console or command-line) in your VPC. Put it in one of the public subnets and give it a public IP
* Log into the EC2 instance via ssh

## Part 2

* You will see an example stack `ec2.json` and a corresponding parameters file `ec2-params.json`
* Examine your VPC setup and based on that, fill out the parameters for your environment, then deploy the stack into a public subnet
* Ensure you can hit the public dns name in your browser (if it fails, make sure the instance has finished booting)

## Part 3

* Create an EC2 instance (via the console or command-line) in your VPC. Put it in one of the private subnets
* Log into the EC2 instance
    * What went wrong?
    * How could you connect to this instance?

## Part 4 (if you finish quickly)

* Edit your VPC stack to add an ACL Entry to the `PublicAcl`
* It should permit port `1337/TCP` inbound from the IP address `203.13.23.30/32` (this is the MEL-VPN endpoint for anyone curious)
* Update your stack and validate the change has worked
  * QUESTION: Examine the current Public ACL, is this change actually required :)

## Cleanup

* Delete your VPC stack and any other resources you created
