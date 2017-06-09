# Kinesis - hands on

This example shows the use of Kinesis to process a twitter stream --
not the full "firehose" that you hear of (that requires a contract), but
the smaller event stream that's available to every twitter consumer.

## Prerequisites

* A twitter account of your own. You can sign up if you like, or team up
  with someone who already has one.
* The following keys from Twitter:
    * Consumer key
    * Consumer secret
    * Access token
    * Access token secret

If you don't already have access tokens for this example, here's how you
get them:

* Go to https://apps.twitter.com -- make sure you log in with your
  existing twitter account
* Click on `Create New App`
    * Give it a name like **REA Kinesis Example**
    * Set the description to something
    * Set the URL to http://realestate.com.au
    * Leave the callback URL blank
    * You'll have to agree to the legal blurb. If you don't want to
      agree with legal blurb, don't, and follow along with someone who
      did. I cannot advise you whether to agree with legal blurb or not.
    * Click `Create new Twitter application`
* Change the Access level of the application so that it's `Read Only`
* Go to the `Keys and Access Tokens` tab:
    * Click `Create my access token`
Copy:
    * Consumer Key (API Key)
    * Consumer Secret (API Secret)
    * Access token
    * Access token secret

## Creating the application

* Edit the `kinesis-example-params.json` file and substitute in your
  Twitter credentials (generated above), and your SSH Keypair. If you
  launch this stack in `ap-southeast-2` in the REA Training account, you
  won't need to change anything else
* Create the stack:

    ```
    localhost$ aws cloudformation create-stack \
        --stack-name <MYNAME>-kinesis-example \
        --template-body file://kinesis-example.json \
        --parameters file://kinesis-example-params.json \
        --capabilities CAPABILITY_IAM
    ```
* Once the stack has completed, look at the Outputs; there will be two
  URLs there, one for a Globe and one for a Heatmap visualisation; I
  recommend viewing these on a system with decent 3D OpenGL drivers (OSX
  is fine, Linux on a Macbook with nouveau drivers is **not**)
* If you want to muck with which tweets are visualized, ssh into the
  ProducerInstance and:
    * kill the `TwitterProducer` process
    * edit `/home/ec2-user/AwsUserData.properties` -- you can set a
      bounding box for geotagged tweets, or search for hashtags (note
      that non-geotagged tweets will appear in the middle of the
      Atlantic)
    * run the code with `java -jar target/TwitterProducer-0.0.1-SNAPSHOT.jar AwsUserData.properties`

## Monitoring

Have a look at the Kinesis metrics via the console to get a feel for how
close to "full" your stream is.

## Shenanigans

Find the name of a Kinesis stream of a colleague; stop your producer (as
described above), edit the `aws.streamName` value in
`AwsUserData.properties` so that it refers to their stream name, and
restart the TwitterProducer process. You'll have to view their
visualisation endpoint and stats, but it's one way of getting Moar Data
into a stream.

## Clean up

Delete the stack once you're done.

You should probably also delete the twitter application.
