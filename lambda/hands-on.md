# Lambda hands-on

We will be creating a thumbnail image generator.

The code is already written, we just need to deploy it to AWS
and plumb it together.

## Step 1 - A bucket
Lambda functions need to be stateless. In this example we will use an S3 bucket
for 3 things:
  * To store our source code .zip file
  * To store a full size image
  * To store the automatically generated thumbnail

We could use 3 different buckets but to keep the example simple, we
 are just using 3 _directories_ in a bucket. (technically, S3 does not have directories)

If you already have a bucket (in the same region) then you can re-use that, otherwise create one.
We will store the bucket name in a shell variable BUCKET_NAME to make the scripting easier.

``` {.bash}
BUCKET_NAME=jnewbigin-lambda
aws s3 mb s3://$BUCKET_NAME
```

## Step 2 - Zip up the source code

zip up the code files. We must include all the files required by the lambda function, including
any modules/libraries. We embed the git hash in the file name so we can track where this version came from.

``` {.bash}
ZIP_NAME=CreateThumbnail-$(git log -1 --pretty=format:%h).zip
zip -9rq $ZIP_NAME CreateThumbnail.js node_modules
```

## Step 3 - Upload the zip to your bucket

We need to make sure we don't mix the code file and our images. We don't want to trigger a thumbnail generation
on our .zip file. To keep things neat, we use the `lambda` directory (key prefix).

``` {.bash}
aws s3 cp $ZIP_NAME s3://$BUCKET_NAME/lambda/
```

## Step 4 - Create the CloudFormation stack

Most of the work is done by cloudformation. This will create for us:
* The Lambda function
* Permission for S3 to invoke our Lambda
* An IAM Role which the Lambda will run under which will permit:
   * Reading from the `/images` directory
   * Writing to the `/thumbnails` directory

``` {.bash}
aws cloudformation create-stack \
    --stack-name thumbnail-$BUCKET_NAME \
    --template-body file://lambda.json \
    --parameters ParameterKey=SourceBucket,ParameterValue=$BUCKET_NAME \
                 ParameterKey=SourceKey,ParameterValue=lambda/$ZIP_NAME \
    --capabilities CAPABILITY_IAM
```

Verify that the stack is created
``` {.bash}
aws cloudformation describe-stacks \
    --stack-name thumbnail-$BUCKET_NAME \
    --query 'Stacks[].StackStatus' \
    --output text
```

It might take a minute or so to complete and reach `CREATE_COMPLETE`

## Step 5 - Create the S3 notification

To do this we must know the ARN of our lambda function. It is possible to give your function a predictable name but 
for this example (in a shared AWS account), we need it to be unique. We will use cloudformation to tell us the ARN

``` {.bash}
aws cloudformation describe-stacks \
    --stack-name thumbnail-$BUCKET_NAME \
    --query 'Stacks[].Outputs[?OutputKey==`S3ImageProcessorARN`].OutputValue' \
    --output text
```

Now edit the event trigger file `s3-notification.json` and replace `$ARN` with our specific value

Once edited, you can set the notification configuration on the bucket. Once this step is complete, your lambda will be _live_
Note that this required a permission which has already been created in the cloudformation stack.

``` {.bash}
aws s3api put-bucket-notification-configuration \
    --bucket $BUCKET_NAME \
    --notification-configuration file://s3-notification.json
```

## Step 6 - Inspect your configuration in the AWS Console
* Code
* Configuration
* Triggers
* Monitoring
* View logs in CloudWatch

## Step 7 - Upload your first image
```  {.bash}
aws s3 cp rea-cloud-guild-logo.jpg s3://$BUCKET_NAME/images/
```

## Step 8 - Inspect the results
``` {.bash}
aws s3 ls s3://$BUCKET_NAME/thumbnails/
aws s3 cp s3://$BUCKET_NAME/thumbnails/rea-cloud-guild-logo.jpg thumbnail.jpg
```

## Step 9 - Clean up
``` {.bash}
aws cloudformation delete-stack --stack-name thumbnail-$BUCKET_NAME
aws s3api delete-bucket --bucket $BUCKET_NAME
```

