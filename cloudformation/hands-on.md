# REA AWS Training - CloudFormation Hands-On

## Reference

http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html

## Part 1

* Examine the template `basic.json`
    * Note the use of `Ref` to reference the AWS::Region pseudo-parameter
    * Note the use of `Fn::FindInMap` as an intrinsic function

* Using the console or the command-line, create a stack using the template `basic.json`
    * What happens if you try to create the stack in a region that's not N. Virginia or Sydney?

    ```
    myhost$ aws cloudformation create-stack \
        --stack-name <mystack> \
        --template-body file://basic.json
    ```

* View the template creation progress via the console, or using the command-line:
    ```
    myhost$ aws cloudformation describe-stack-events \
        --stack-name <mystack> \
        --query 'StackEvents[].{LogicalResourceId: LogicalResourceId, ResourceType: ResourceType, ResourceStatus: ResourceStatus}' \
        --output table
    ```

* This EC2 instance has no keypair, so you can't log in to it.
  How would you fix that? Have a look in the CloudFormation resource type
  reference for an AWS::EC2::Instance if you're a bit stuck
    * Can it be done without recreating the instance?

* Change the template so that it now has the keypair that you created in
  the EC2 hands-on, earlier.

* Update the stack without deleting it. What happens to the EC2 instance?
  (You can follow along the stack progress in the console, or by using the
  command from above)
    ```
    myhost$ aws cloudformation update-stack \
        --stack-name <mystack> \
        --template-body file://basic.json
    ```

* Delete the stack when you're done
    ```
    myhost$ aws cloudformation delete-stack \
        --stack-name <mystack>
    ```

## Part 2

* Examine the contents of the `stack-with-parameters.json` template -- what
  does it do?

* Using the console or the command-line, create a stack using the
  `parameters.json` template. There's a set of parameter examples in
  the `parameters-params.json` file.
    ```
    myhost$ aws cloudformation create-stack \
        --stack-name <myname>-test-2 \
        --template-body file://stack-with-parameters.json \
        --parameters file://stack-with-parameters-params.json
    ```

* What happens if you update the stack with different parameters? Edit the file
  `stack-with-parameters-params.json` and change the `VolumeVersion` or
  `VolumeName` values and then update the stack.
    ```
    myhost$ aws cloudformation update-stack \
        --stack-name <myname>-test-2 \
        --template-body file://stack-with-parameters.json \
        --parameters file://stack-with-parameters-params.json
    ```

* Delete the stack when you're done
    ```
    myhost$ aws cloudformation delete-stack \
        --stack-name <myname>-test
    ```

## Part 3

Have a look at the sample templates in
http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-sample-templates-ap-southeast-2.html
to see some of the range of things that cloudformation can do.
