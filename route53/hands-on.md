# Route 53 hands on

## Part 1 - Setup

* Use the existing DNS domain `awstraining.realestate.com.au`

* Create an S3 bucket called `<yoursitename>.awstraining.realestate.com.au` -- yes, the whole
  thing with the dots.

    ```
    localhost$ aws s3 mb s3://mycoolsite.awstraining.realestate.com.au
    make_bucket: s3://mycoolsite.awstraining.realestate.com.au/
    ```

* configure the bucket for static website hosting:
    * Upload the file `sorry.html` to the bucket.

        ```
        localhost$ aws s3 cp sorry.html s3://mycoolsite.awstraining.realestate.com.au
        upload: ./sorry.html to s3://mycoolsite.awstraining.realestate.com.au/sorry.html
        ```

    * Enable website hosting and set the index document to be `sorry.html`:

        ```
        localhost$ aws s3api put-bucket-website \
            --bucket mycoolsite.awstraining.realestate.com.au \
            --website-configuration '{"IndexDocument":{"Suffix":"sorry.html"}}'
        ```

    * Add the bucket policy `static-website-policy.json` to the bucket -- make sure you
      **edit it first** so that it has your bucket's name in it!

        ```
        localhost$ aws s3api put-bucket-policy \
            --bucket mycoolsite.awstraining.realestate.com.au \
            --policy file://static-website-policy.json
        ```
  
* Verify that you can view the bucket static website endpoint in a browser -- the URL will be
  something like
  http://yoursitename.awstraining.realestate.com.au.s3-website-ap-southeast-2.amazonaws.com
  and you should see a page which says "Sorry!" and something about boring text.

* Create an application stack using the `autoscaling-elb-example.json` template from this
  directory. If you already have an application example stack still in existence, you can
  use that (make sure it has an ELB though)

    ```
    localhost$ aws cloudformation create-stack \
        --stack-name <mystack>-route53-test \
        --template-body file://autoscaling-elb-example.json \
        --parameters ParameterKey=SiteName,ParameterValue=mycoolsite.awstraining.realestate.com.au


    {
        "StackId": "arn:aws:cloudformation:ap-southeast-2:561534074837:stack/<mystack>-route53-test/de9bed30-4c7a-11e5-a865-5081ed124436"
    }
    ```

* Look at the outputs of the stack to find the URL of your test website

* Create a Route 53 Health Check that points at the HTTP endpoint of the application
  stack. It'll tell you that you should use an ALIAS record for ELBs, but carry on
  regardless. You can do this in the console:
    * Name can be something that is meaningful to you, like `yoursitename-site-check`
    * Protocol is HTTP
    * Specify endpoint by domain name
    * Paste in the full ELB hostname (something like
      yourstack-ElasticLoa-1C748MJE03QJ3-22117048.ap-southeast-2.elb.amazonaws.com)
    * Keep everything else as default and click "Create"

  ... or you can use the command line:

    ```
    localhost$ aws route53 create-health-check \
        --caller-reference <yoursitename>-site-check \
        --health-check-config Type=HTTP,FullyQualifiedDomainName=<URL of your site without the http:// part>


    {
        "HealthCheck": {
            "HealthCheckConfig": {
                "FailureThreshold": 3, 
                "RequestInterval": 30, 
                "Type": "HTTP", 
                "Port": 80, 
                "FullyQualifiedDomainName": "<yourstackname>-<guff>.ap-southeast-2.elb.amazonaws.com"
            }, 
            "CallerReference": "<yoursitename>-site-check", 
            "HealthCheckVersion": 1, 
            "Id": "63c9a7b2-ef53-46c4-89f9-04a71cee35c7"
        }, 
        "Location": "https://route53.amazonaws.com/2015-01-01/healthcheck/63c9a7b2-ef53-46c4-89f9-04a71cee35c7"
    }
    ```
  Save the health check ID for later.

* After a minute, the Health Check that you created should show a status of "Healthy"
  (provided your ELB is actually up and serving content) -- you can check via the console,
  or via command line:

    ```
    localhost$ aws route53 get-health-check-status --health-check-id <ID-from-above>


    ... (lots of results) ...
    ```

* Create DNS records to route traffic to your new site using the name that you chose in
  the beginning. You can either use the console:

    * In the main Route 53 console, go to Hosted Zones; select `awstraining.realestate.com.au` and
      then click "Go To Record Sets"

    * Create a Route 53 Record Set called `<yoursitename>.awstraining.realestate.com.au` and:
        * make it an A record
        * make it an ALIAS
        * Make the alias target be your ELB (it should show up in the dropdown menu)
        * Set the Routing Policy to be Failover.
        * Set the Failover Record Type to Primary.
        * Associate the policy with the health check that you just created.

    * Create another Route 53 Record Set with the EXACT SAME NAME as the first and:
        * Make it an A record
        * make it an ALIAS
        * make the alias target be your S3 static website -- it should show up in the
          dropdown menu
        * set the routing policy to be Failover
        * Set the Failover Record Type to be Secondary
        * You don't have to associate a health check -- we're going to assume S3 never goes
          down.

  ... or you can use the command-line:

    * You'll need to find out:
        * the hosted zone ID for `awstraining.realestate.com.au`:

            ```
            localhost$ aws route53 list-hosted-zones-by-name \
                --dns-name awstraining.realestate.com.au \
                --query 'HostedZones[].Id' \
                --output text


            /hostedzone/Z16NTPA31DI2XN
            ```

        * the ELB name from your cloudformation stack; it'll be something like
          `<mystack>-ElasticLoa-ABCD1234ABCD`
        * the health check ID that you created above
        * The hosted zone ID for the S3 region where your bucket is located. You can 
          find the zone IDs at http://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region
          but the ID for `ap-southeast-2` is `Z1WCIGYICN2BYD`
    * Edit the `rrset-create.json` and substitute in:
        * your site name
        * the name of your ELB
        * the health check ID
        * the DNS name of the S3 bucket (eg `<yoursite>.awstraining.realestate.com.au.s3-website-endpoint-ap...`)
    * Create the resource record set:

        ```
        localhost$ aws route53 change-resource-record-sets \
            --hosted-zone-id A1B2CD9SDF1DS \
            --change-batch file://rrset-create.json
        ```

## Part 2 - Making it work

* Visit <yourname>.awstraining.realestate.com.au in a browser to verify that it shows
  you the normal non-sorry page. If your index.html is empty, you'll get a blank page.

* Use a DNS lookup tool (command-line: `host`, or `dig`) or
  http://www.whois.com.au/whois/dns.html for a browser lookup to resolve
  <yourname>.awstraining.realestate.com.au -- note the values that are returned (the
  hostname and the IP address)

* In the EC2 console, change the Security Group associated with the ELB for the 
  application stack so that port 80 is blocked. For example, change the HTTP rule
  to be HTTPS and then save the change

* Monitor the Route 53 health check that you created to see when it starts to fail. Note that
  by default, the health check looks every 30 seconds and has to fail 3 times before it will
  fail traffic over (so, 1.5 minutes). You can look at the Monitoring tab for the health check
  to see its status. For command-line users:

    ```
    localhost$ aws route53 get-health-check-status \
        --health-check-id <healthcheck-id> \
        --query 'HealthCheckObservations[].StatusReport.Status'
    ```

* Keep resolving the hostname `<yourname>.awstraining.realestate.com.au` to see when it
  switches over to the failover name

* Visit `<yourname>.awstraining.realestate.com.au` in a browser to verify that it shows
  you the sorry page.

* Change the ELB security group to re-enable access, and verify that you can see the
  original application server pages again once the DNS TTLs have expired.

## Cleanup

* Delete your Route53 ALIAS A records (both the primary and secondary failover records)

* Delete your Route53 Health Check

* Delete your application stack

* DO NOT DELETE your S3 bucket -- we'll use it in the next module
