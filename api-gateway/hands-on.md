# Lambda hands-on

We will be creating a image scaling API

The code is already written, we just need to deploy it to AWS
and plumb it together.

## Step 1 - A bucket
Lambda functions need to be stateless. In this example we will use an S3 bucket
for 3 things:
  * To store our source code .zip file
  * To store a full size image
  * To store the resized image

We could use 3 different buckets but to keep the example simple, we
 are just using 3 _directories_ in a bucket. (technically, S3 does not have directories)

If you already have a bucket (in the same region) then you can re-use that, otherwise create one.
We will store the bucket name in a shell variable BUCKET_NAME to make the scripting easier.

The result output of our API will be a signed URL which points to the bucket we will turn on static
web site hosting.

``` {.bash}
BUCKET_NAME=jnewbigin-lambda
aws s3 mb s3://$BUCKET_NAME
```

## Step 2 - Zip up the source code

zip up the code files. We must include all the files required by the lambda function, including
any modules/libraries. We embed the git hash in the file name so we can track where this version came from.

``` {.bash}
ZIP_NAME=ImageResizer-$(git log -1 --pretty=format:%h).zip
zip -9rq $ZIP_NAME ImageResizer.js node_modules
```

## Step 3 - Upload the zip to your bucket

``` {.bash}
aws s3 cp $ZIP_NAME s3://$BUCKET_NAME/lambda/
```

## Step 4 - Create the Lambda CloudFormation stack

Most of the work is done by cloudformation. This will create for us:
* The Lambda function
* An IAM Role which the Lambda will run under which will permit:
   * Reading from the `/images` directory
   * Writing to the `/resized` directory

``` {.bash}
aws cloudformation create-stack \
    --stack-name resizer-lambda-$BUCKET_NAME \
    --template-body file://lambda.json \
    --parameters ParameterKey=SourceBucket,ParameterValue=$BUCKET_NAME \
                 ParameterKey=SourceKey,ParameterValue=lambda/$ZIP_NAME \
    --capabilities CAPABILITY_IAM
```

Verify that the stack is created
``` {.bash}
aws cloudformation describe-stacks \
    --stack-name resizer-lambda-$BUCKET_NAME \
    --query 'Stacks[].StackStatus' \
    --output text
```

Inspect the outputs
``` {.bash}
aws cloudformation describe-stacks \
    --stack-name resizer-lambda-$BUCKET_NAME \
    --query 'Stacks[].Outputs[?OutputKey==`ImageProcessorARN`].OutputValue' \
    --output text
```

We do not need to manually copy the ARN because it has been *exported*


## Step 5 - Create the API gateway CloudFormation stack

To do this we must know the ARN of our lambda function. It is possible to give your function a predictable name but 
for this example (in a shared AWS account), we need it to be unique. We have exported the value from the lambda
stack so in this stack we will use the SourceBucket parameter, not to reference and S3 bucket but rather a cloudformation
export.

``` {.bash}
aws cloudformation create-stack \
    --stack-name resizer-api-$BUCKET_NAME \
    --template-body file://api.json \
    --parameters ParameterKey=SourceBucket,ParameterValue=$BUCKET_NAME \
    --capabilities CAPABILITY_IAM
```

Verify that the stack is created
``` {.bash}
aws cloudformation describe-stacks \
    --stack-name resizer-api-$BUCKET_NAME \
    --query 'Stacks[].StackStatus' \
    --output text
```

Because API Gateway is integrated with cloudfront, it can take a few minutes for the stack to be created.


``` {.bash}
aws cloudformation describe-stacks \
    --stack-name resizer-api-$BUCKET_NAME \
    --query 'Stacks[].Outputs[?OutputKey==`RootUrl`].OutputValue' \
    --output text
```

## Step 6 - Inspect your configuration in the AWS Console

Have a look at:
 * Methods
 * Method executions
 * Method request
 * Integration Request
   * Body mapping templates
   * application/json
 * Integration Resonse
 * Method Response
 * Stages

## Step 7 - Upload your first image
If you already did this in the lambda exercise then you don't need to do it a second time.

```  {.bash}
aws s3 cp rea-cloud-guild-logo.jpg s3://$BUCKET_NAME/images/
```

## Step 8 - Invoke your API
``` {.bash}
curl 'https://tfmyw8wtu7.execute-api.ap-southeast-2.amazonaws.com/LATEST/image?width=1000&height=1000&image=rea-cloud-guild-logo.jpg'

```

Open that URL in your web browser.

What happens if you don't supply the required parameters or use invalid values?

## Step 9 - Clean up
``` {.bash}
aws cloudformation delete-stack --stack-name resizer-api-$BUCKET_NAME
aws cloudformation delete-stack --stack-name resizer-lambda-$BUCKET_NAME
aws s3 ls s3://$BUCKET_NAME --recursive | cut -c 32- | xargs -I '{}' aws s3 rm "s3://$BUCKET_NAME/{}"
aws s3api delete-bucket --bucket $BUCKET_NAME
```

