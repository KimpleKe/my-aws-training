# REA AWS Training - IAM, Autoscaling and ELB

## Part 1 - Resilience

* Create cloudformation stack using the template
  `autoscaling-elb-app.yml`

    ```
    myhost$ aws cloudformation create-stack \
        --stack-name '<firstname-lastname>-asg-elb' \
        --template-body file://autoscaling-elb-app.yml \
        --capabilities CAPABILITY_IAM
    ```

* Note that creating the stack doesn't create an EC2 instance -- it
  creates an ASG, which then creates and manages a fleet of EC2
  instances.

* Once the stack is up and running visit the LoadBalancerAddress from the
  `Outputs` of the stack in your browser to confirm its operation

* Using the console, kill the instance; what happens? How long does it
  take to respawn a new instance?

## Part 2 - IAM policies

* Click on the link to the page with content coming from S3. It should display an error:
  every 5 seconds the instance is trying to pull a file from S3 and it's failing
  because it doesn't have the permission to access files from that bucket.

* Find which bucket it's getting the file from in the user data script. In the
  cloudformation template, add an IAM policy to the `iamRole` resource
  to allow getting objects (`s3:GetObject`) from that bucket (`arn:aws:s3:::$BUCKET/*`).
  As an example, there is a policy called `uselessPolicy`. You can modify that one or
  create a new policy. **Do not create a bucket policy on the existing bucket**.

* You should now be able to access `/s3.html` without permission errors.

## Part 3 - Capacity scaling

* Use the URL from the Outputs of the stack created above

* Either:
    * Use the script `generate-load` in this directory to generate some
      load on the website, using the URL from above as its single
      parameter on the command line:
        ```shell
        myhost$ ./generate-load http://cmptest-ElasticLoa-...
        Generating load ... use Ctrl-C to stop
        ....................
        ```
    * or just hit the load generation page in a browser several times in a
      row

* How long does it take for CloudWatch to notice that your instance is loaded
  and trigger an autoscaling action? Is it instant? What implications might
  this have? Once it does trigger autoscaling, how long does it take before
  the instance is in service?

* In the EC2 console, look at the "Monitoring" tab for your instance. Check
  the "CPU Utilization" metric and watch it rise over time as your load
  generation forces the instance to work harder. (Note that this is CPU
  Utilization measured by the EC2 hypervisor from outside the instance, so
  there's no breakdown of whether it's User, System, I/O Wait, etc.)

* Once the ASG has created an additional instance, stop the load generator.

* In the EC2 console, go to the "Auto Scaling Groups" page and look at
  your autoscaling group. Check the "Scaling History" tab to see why
  the ASG scaled up. You can drill into the scaling event to see
  the cause.

* There is no scale down policy, so we're now wasting resources.
  Create an alarm for when the CPU is low and a Scale Down Policy
  that will remove one instance at a time.
  You can update your stack with:
    ```
    myhost$ aws cloudformation update-stack \
        --stack-name '<firstname-lastname>-asg-elb' \
        --template-body file://autoscaling-elb-app.yml \
        --capabilities CAPABILITY_IAM
    ```
## Part 4 - Scheduled events

* Edit the template `autoscaling-elb-app-scheduled.yml` so that
  the start time of the scale-up event is a few minutes in the future
  (using the cron-style scheduling, so that's "MM HH DoM MON DoW" where
  a `*` means "all possible ones". For example, `14 13 * * *` means
  "14 minutes past 1pm every day". **NOTE** that the time is in UTC,
  or "Zulu" time, not Melbourne local time!
  * `env TZ=UTC date "+%H %M"` from your shell will give you the current time in UTC

* Make the scale-down time be 5 minutes after the scale-up event.
  The scale-down event has to be far enough away from the scale-up
  event that it's outside the cooldown period for the autoscaling
  group (for this exercise, it's set to 180 seconds or 3 minutes).
  Bear in mind that every instance launch is a flagfall cost of 1 hour!

* Update the stack you created in part 1 using the scheduled example
  template:
    ```
    myhost$ aws cloudformation update-stack \
        --stack-name '<firstname-lastname>-asg-elb' \
        --template-body file://autoscaling-elb-app-scheduled.yml \
        --capabilities CAPABILITY_IAM
    ```

* In the console verify that, after the scale up scheduled time,
  autoscaling has adjusted the DesiredCapacity of the ASG and started
  an instance for you.

* Close to (shortly after) the time you defined in the scale-down schedule,
  you should see autoscaling terminate your instance(s) and your site should
  become unavailable
