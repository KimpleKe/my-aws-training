# REA AWS Training -- CloudFormation Custom Resources

Taken from https://github.com/awslabs/aws-cfn-custom-resource-examples

It takes several minutes to create the first stack (at least 5). While you
wait, have a look through the templates for the resource runner stack and
the AMI lookup stack to see if you can work out how it works.

## Things to notice about the resource runner stack

1. It uses `cfn-init` to process the `Metadata` section of the `LaunchConfiguration`, which:
    * installs the `cfn-resource-bridge` package
    * creates some config files
    * installs a script downloaded from github
    * starts some system services and makes sure they'll restart if the system reboots
1. It uses a WaitCondition to signal the stack once it's finished running `cfn-init`
1. It makes use of a sub-stack to create the resource pipeline; the sub-stack template
   is not included here! It uses a reference to a URL pointing to a template in an S3 bucket
1. Note the use of IAM roles to allow the resource runner instance to interact with SQS queues
   and to insert items into a DynamoDB table, but not do anything else with the AWS APIs

## Part 1

* Create a cloudformation stack using the `resource-runner.json` template.
  You will have to supply an SSH key name as the parameter for SSHKeyName.
  Other default parameters are fine.
    ```shell
    myhost$ aws cloudformation create-stack \
        --stack-name my-resource-runner \
        --template-body file://resource-runner.json \
        --parameters ParameterKey=SSHKeyName,ParameterValue=my-ssh-keypair \
        --capabilities CAPABILITY_IAM
    ```

* Take the value of the ServiceToken output from the stack that you've just created (note that
  it creates a stack inside the stack, one of them has a ServiceToken output and the other
  doesn't)

* Create a second stack using the `ami-lookup.json` template -- pass in the ServiceToken from
  the first stack as a parameter
    ```shell
    myhost$ aws cloudformation create-stack \
        --stack-name my-ami-lookup \
        --template-body file://ami-lookup.json \
        --parameters ParameterKey=ServiceToken,ParameterValue=<service-token>
    ```

* Look! It's created an instance whose AMI Id was looked up as a custom resource
    * Look at the CloudFormation resource for the ami lookup stack; note that the Physical ID
      for the `Custom::AmiLookup` resource is an actual AMI.

* Imagine what else you could do with this ...
    * spin up DB instance in a datacentre ...
    * update DNS records ...
    * send confirmation email of stack changes to an admin ... and wait for a response
    * etc.

## Part 2

* Delete the AMI lookup stack. DO NOT DELETE the resource runner stack.

* Look at the Events for the AMI lookup stack, while it's deleting or after it's deleted (if
  it's been deleted, you'll have to change the Filter at the top of the CloudFormation stacks
  list page to 'Deleted' instead of 'Active')
    * What has to happen for the `Custom::AmiLookup` resource to be deleted?

* Look at the DynamoDB table created by your stack via the console:
    * Select the table in the list
    * Click "Explore Table"
    * Notice there are "Create" and "Delete" request types. What would happen if you deleted
      the resource runner stack first, and then deleted the AMI lookup stack?

## Clean up

* Delete any AMI lookup stacks that you've created. DO NOT delete your resource runner stack
  until you've deleted all your AMI lookup stacks.

* Delete your resource runner stack. When you delete your resource runner stack, just delete
  the top-level stack (not the CustomResourcePipeline one). It will delete the sub-stack as
  well.

