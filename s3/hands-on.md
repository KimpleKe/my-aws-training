# REA AWS Training - S3 Hands-On

## Part 1

* Using the console, create an S3 bucket -- you'll
  have to think of a name for it yourself. Please call it
  `<something>.awstraining.realestate.com.au` -- for example,
  `delicate-snowflake.awstraining.realestate.com.au`. Make sure you use
  the WHOLE name, so that it looks like a hostname.
    * try creating one called `pki.realestate.com.au` -- what happens?

    ```
    myhost$ aws s3 mb s3://<mybucket>.awstraining.realestate.com.au/
    myhost$ aws s3 mb s3://pki.realestate.com.au/
    ```

* Using the console or the command-line, upload index.html to your bucket
    ```
    myhost$ aws s3 cp index.html s3://<mybucket>.awstraining.realestate.com.au/
    ```

* Check the contents of the bucket
    ```
    myhost$ aws s3 ls s3://<mybucket>.awstraining.realestate.com.au/
    ```

* Enable static website hosting for the bucket, either via the console or
  using the following command line:
    ```
    myhost$ aws s3api put-bucket-website \
        --bucket <mybucket>.awstraining.realestate.com.au \
        --website-configuration file://enable-static-hosting.json
    ```

* Attempt to browse to the URL of the bucket,
  `http://<mybucket>.awstraining.realestate.com.au`
    * does it work? Why not?

* Run the script `create-dns-for-bucket mybucket.awstraining.realestate.com.au` to
  have Route53 create an ALIAS record for your static website bucket so that
  web browsers can find it:
    ```
    myhost$ ./create-dns-for-bucket <mybucket>.awstraining.realestate.com.au
    ```

* Reload the URL of the bucket in your browser. Does it work now? If you tried to
  reach it before, you might have to wait a minute or two, because of negative caching.

  Note that it may take up to 10 minutes for the change to take affect.  `dig <mybucket>.awstraining.realestate.com.au` will report how many seconds are remaining for the change to take affect.

  If you get a 403, it's because not even the S3 website hosting endpoints have the
  right to read your bucket yet!

* Edit the file `static-website-policy.json` to have the name of your bucket in it

* Add the bucket policy from your edited copy of `static-website-policy.json`
  to your bucket, either via the console or via the command-line with the command:
    ```
    myhost$ aws s3api put-bucket-policy \
        --bucket <mybucket>.awstraining.realestate.com.au \
        --policy file://static-website-policy.json
    ```

* Attempt to browse to the static website for the bucket now

## Part 2

* Again using the console or command-line, upload ../ec2/index.html over the
  top of the current existing index.html

* Browse the static website; has the content changed?

* Using the console, enable bucket versioning

* Upload the index.html from the s3 directory over the top of the ec2 one

* In the console, look at the bucket contents; choose "Show" for versions;
    * what do you see?

* In the console, DELETE index.html; with versions shown, what does that
  look like?

## Part 3

* Again using the console, add a lifcycle rule to the bucket -- make it whatever you like
    * Note that "Archive" means that content will go to Glacier

* See what options are available to you for lifecycle rules

## Part 4

* Delete the bucket -- it's harder than you think, right?

* Use the script `delete-dns-for-bucket` to remove the DNS entries you created earlier:
    ```
    myhost$ ./delete-dns-for-bucket <mybucket>.awstraining.realestate.com.au
    ```
