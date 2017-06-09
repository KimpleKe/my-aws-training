# DynamoDB

## Caveat

**NOTE:** Until such time as Lambda is available in Sydney, you will have to 
run this hands-on in a region that supports it. This exercise specifically works
in Tokyo, because Lambda requires an S3 bucket that's in the same region.

If you want to try this hands-on in a different region, first create an S3
bucket _in that region_ called `rea-training-data-<region-name>`
(eg `rea-training-data-ap-southeast-2`) and then zip the provided `dynamo-streams.py`
into a zipfile called `DynamoStreamsLambda.zip` and put that zipfile in the
bucket that you created.

## The Actual Hands-On

* Create a CloudFormation stack in `ap-northeast-1` (Tokyo) from the template file
  `dynamo-streams.json` -- you do not need to specify any parameters:

    localhost$ aws cloudformation create-stack \
        --stack-name <mystack>-ddb-test \
        --template-body file://dynamo-streams.json \
        --capabilities CAPABILITY_IAM

* Once the stack has finished creation, find the name of the DynamoDB Table by
  examining the stack outputs.

* Insert a record into the DynamoDB table; from the command-line, it looks like this:

    localhost$ aws --region ap-northeast-1 dynamodb put-item \
        --table-name <my-table-name> \
        --item '{"Item":{"S":"Hat"},"Price":{"N":"19.95"}}'

  From the console:
    * Make sure the region `Tokyo` is selected
    * go to the DynamoDB service, and click `Tables`
    * Click your table name (found from the CloudFormation stack Outputs)
    * Click the `Items` tab in the frame that appears
    * Click `Create Item`
    * In the form which pops up, enter `Hat` in the `Item` field, and `19.95` in the
      `Price` field
    * Click `Save`

* In the console, go to CloudWatch Logs -- which is where Lambda logs go (make sure
  you're in the Tokyo region)

* Find the log group that's named for the Lambda function you created in the stack --
  something like `/aws/lambda/mystack-TriggerLambda-AB132ASDF4324` and click it.

* Find the latest log stream and click it. It may take a few seconds for the stream
  to receive the latest updates in the console, so you might have to click the
  refresh button at the top of the list of streams a few times.

* The latest stream should contain a log which looks like:

    You added an item: 'Hat' with price 19.950000

Congratulations! You've got a DynamoDB table which triggers a Lambda function
whenever an item is updated!
