# REA AWS Training - CloudWatch Hands-on

## Part 1

* Create a cloudformation stack (via console or command-line)
  using the template in `cloudwatch-example.json`

    ```
    myhost$ aws cloudformation create-stack \
        --stack-name <mystack>-cloudwatch \
        --template-body file://cloudwatch-example.json \
        --capabilities CAPABILITY_IAM
    ```

* Using the console, investigate which CloudWatch metrics exist
  for elements of this stack. Check the EC2 metrics, searching for the instance ID
  from your cloudformation stack.

* Configure a Cloudwatch alarm for CPUUtilization:
    * In the EC2 Console, find the EC2 instance created by your stack (it will have the same
      name). Under the "Monitoring" tab, click the button "Create Alarm". Set the following
      properties:
        * Send a notification to the topic `your-name-rea-group-com` with receipient `your-name@rea-group.com`.
          * Example: topicname `nitin-sharma-rea-group-com` with receipient name `nitin.sharma@rea-group.com`.
        * Whenever Minimum of `CPUUtilization` is <= 5 percent for 1 period of 5 minutes

## Part 2 - custom metrics

* Using the command-line, publish a custom metric

    ```
    aws cloudwatch put-metric-data \
        --namespace '<firstname-lastname>-metrics' \
        --metric-name 'custom-metric1' \
        --value <int>
    ```

* Using the console, investigate your custom metric
* How might you be able to use this functionality to monitor:
 * The memory usage of a JVM?
 * Error count from a batch job
* What other metrics might you be able to push into CloudWatch?

## Part 3 - CloudWatch Logs

**This bit might only work for one person -- probably do it on the big screen**
**That's because the metric filter is across the whole account (in that region),
so creating multiple metric filters against the same log group won't work.**

* In the CloudWatch console, browse to the Logs page
* Look under the log group `/var/log/secure` for your EC2 instance (you can find the instance
  ID in the EC2 console, against your stack name)
* Have a look at the logs -- notice that it's recording things like SSH login attempts to your
  instance, whenever `sudo` is run, etc
* Back at the top level, select the check box next to the `/var/log/secure` log group and
  click `Create Metric Filter`
    * Set the "Filter pattern" to be "Connection closed by"
    * Click "Assign Metric"
    * Set the "Metric Name" to "SSHClosedConnections"
    * Click "Create Filter"
* Create an alarm whenever sum(SSHClosedConnections) >= 1 for 5 minutes
* ssh to the EC2 instance and wait for the alarm to go poot
