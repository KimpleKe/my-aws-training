# REA AWS Training - Application Services Hands-on

## Part 1

* Create an SNS topic -- name it something unique to
  you. You do not have to create a display name, since we aren't going
  to be sending SMSes to ourselves (we don't have US phone numbers). You
  can use the console, or the following command-line:

    ```
    localhost$ aws sns create-topic --name <myname>-topic


    {
        "TopicArn": "arn:aws:sns:ap-southeast-2:561534074837:<myname>-topic"
    }
    ```

  Note the ARN if you're going to be using the command-line. If you're
  using the console, don't worry about it.

* Once the topic is created, select it and then "Edit Topic Policy"
  from the "All Topic Actions" dropdown menu. In the "Basic View",
  set the following values:

    * Allow these users to publish messages to this topic: "Everyone"

  If you're using the command-line:

    * Edit `sns-topic-policy.json` and substitute your topic ARN into
      the `Resource` fields

    ```
    localhost$ aws sns set-topic-attributes \
        --topic-arn <ARN-FROM-ABOVE> \
        --attribute-name Policy \
        --attribute-value file://sns-topic-policy.json
    ```

  **BE AWARE:** the command-line will let you set an invalid policy; if
  you haven't edited the `sns-topic-policy.json` file, the rest of this
  hands-on won't work.

* Create a new subscription for your new topic; make it an email
  subscription, and use your own email address. You can use the console,
  or on the command-line:

    ```
    localhost$ aws sns subscribe \
        --topic-arn <ARN-FROM-ABOVE> \
        --protocol email \
        --notification-endpoint <your-email-address>
    ```

    * You'll have to check your email and confirm the subscription
      request -- this is to stop people spamming others via SNS

* Publish a message to the topic; note that you can have different
  message bodies for different notification types (eg SMS, email, APNS,
  etc). If you use the command-line:

    ```
    localhost$ aws sns publish \
        --topic-arn <ARN-FROM-ABOVE> \
        --message 'Hello, world!'
    ```

* Confirm that you've received the email -- huzzah!

## Part 2

* Using the console, create an SQS queue. It does not have to be in the
  same region as the SNS topic. If you use the command-line:

    ```
    localhost$ aws sqs create-queue \
        --queue-name <MYNAME>-queue

    {
        "QueueUrl": "https://ap-southeast-2.queue.amazonaws.com/561534074837/<MYNAME>-queue"
    }
    ```

  You will have to construct an ARN for the queue from this URL. It'll
  be of the form: `arn:aws:sqs:<region>:<accountid>:<MYNAME-queue>`

* Using the console, subscribe the SQS queue to the topic you created
  before; make sure you choose the correct region, and you should see
  the topic in the drop-down list.

  If you want to use the command-line, you're a bit on your own at the
  moment because the command-line usage for setting a queue policy is
  horribly opaque and I haven't worked it out yet. Sorry.

* Using the console or the command-line `publish` script, publish some
  messages to the topic; the subscribed
  queue(s) should get copies, and you should also receive the email copy.
  You can view the messages in the queue in the console.

    * Note that when using the console to view messages, you will have
      to choose to start and then stop polling in order to interact
      with messages.

    * Note also that you have to delete messages to remove them from
      the queue -- this differs from behaviour of other queue brokers
      in that they tend to consider the message delivered as soon as a
      consumer takes it. In many ways, this is more robust.

    * When a consumer views a message, it moves from the "Available"
      state to "In Flight" -- it stays there until either it is
      deleted, or until it times out and returns to "Available"

* On the command-line, run the `receive-messages` script with the queue
  URL as the argument. Have a few other people use the same queue URL.
  Do you all see the same messages? Do they always arrive in order?

## Part 3

* Create a CloudFormation stack using the `autoscaling-elb-example.json`
  template in this directory. When creating the stack, use the ARN
  of the topic you created above as the notification ARN:

    ```shell
    myhost$ aws cloudformation create-stack \
        --stack-name mystack \
        --template-body file://autoscaling-elb-example.json \
        --notification-arns arn:aws:sns:ap-southeast-2:123456789012:MyTopicName
    ```

* Notice that you'll receive an email for every CloudFormation event for that stack


## Clean up

* Delete the CloudFormation stack

* Delete your email subscription

* Delete your SQS subscription

* Purge your SQS queue and delete it

* Delete your SNS topic

* Delete the subscriptions too (yes, they still exist even when you delete the topic)


