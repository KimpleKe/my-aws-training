# REA AWS Training - ElastiCache

## ElasticCache - Redis

### Part 1 - Setup

* Create an Elasticache cluster using the template in `elasticache-redis.json`. Make
  sure you specify an SSH key that you have access to. It can take up to 10 minutes 
  to create the stack:

    ```
    myhost$ aws cloudformation create-stack --stack-name mystack \
        --template-body file://elasticache-redis.json \
        --parameters ParameterKey=KeyName,ParameterValue=MY_SSH_KEY_NAME \
        --capabilities CAPABILITY_IAM
    ```

* The URL of the EC2 instance that can talk to the Redis cluster is in the Outputs
  section of the cloudformation stack. Browse to the EC2 instance and, once everything
  is up and running, you should see a page with the name of the Redis cluster and the
  value of the test key: "Hello, World!". The demo key should be empty.

* Get the IP address of the EC2 instance and log in to it, using the SSH key that you
  specified above.

* Look at the ElastiCache page in the console and find the endpoint name for the cache
  node.

* Launch the redis command-line client and set a value for the key 'demokey' by
  connecting to the hostname of the ElastiCache node:

  ```
  instance$ redis-cli -h <cache_endpoint> set demokey 'some value'
  OK
  ```

* Refresh the page with the Redis cluster details (above) and check that the demokey is
  now set to whatever you defined it as above.

### Part 2 - Read Replicas

* Cloudformation currently doesn't support generation of read replicas or replication
  groups -- so you'll have to this part by hand.

* Go to the ElastiCache console and click on Replication Groups.
    * Create a new Replication Group
        * specify your existing cluster as the primary
        * give it some random ID (your name, or something) and a description
    * The group, once created, will have the same security group as the original node
      -- meaning that you'll be able to connect to it from the EC2 instance.
    * Once the replication group has become available (it'll be fast):
        * select it in the Elasticache console and choose 'Add Read Replica'
        * Give the replica an ID -- something like 'replica-1' and choose an
          availability zone.
    * It'll take a while to create the read replica; several minutes. Once it's done,
      get the replica endpoint, and use the redis CLI on the EC2 instance to query the
      values of the keys 'testkey' and 'demokey' -- they should be the values set
      above.
    * Drill down into the replication group and look at its details -- note that
      there's a `Primary Endpoint` -- this is a DNS CNAME that points to whichever node
      is currently the read-write master in the replication group.

### Part 3 - Snapshots

* If you like (and have time), create a snapshot of the primary node in the cluster. 
  It'll take a few minutes. You can then use that snapshot to create a new cluster.
  It'll take several minutes as well.

### Part 4 - Promotion/Demotion

* You can promote a read replica to a master, but before you do that, you should:
    * change the contents of `/tmp/cacheclusterconfig` to set the `Address` 
      of the `Endpoint` of `CacheNodes` to the primary endpoint of the 
      replication group (see above)
    * failing to update that file (which is parsed by the PHP each page load) will 
      break the tiny PHP page which shows you the value of testkey and demokey -- 
      it'll be talking to a read-only replica now.

### Part 5 - cleanup

* Please clean up things when you're done -- if you created read replicas, delete the
  replication group FIRST (if you don't no biggie -- but you have to delete the
  replication group to delete the cluster). You'll have to delete the replication group
  to be able to delete the cloudformation stack.

* also please clean up snapshots that you might have taken

* Cloud Formation stacks can be deleted too.

## ElastiCache - Memcached

### Part 1 - Setup

* Create a cloudformation stack using the `elasticache-memcached.json` template; make
  sure you use an SSH key that you have access to, because you're likely to want to log
  in to the EC2 instance to play around.

    ```
    myhost$ aws cloudformation create-stack --stack-name my-memcache-stack \
        --template-body file://elasticache-memcached.json \
        --parameters ParameterKey=KeyName,ParameterValue=MY_SSH_KEY_NAME \
        --capabilities CAPABILITY_IAM
    ```

* Once the stack has completed, browse to the URL in the Outputs tab of the stack --
  you should see some information about saved string and integer keys.

### Part 2 - Scaling up

* The example app uses the dynamic configuration endpoint to find out where the cluster
  nodes are. If you add another node, it'll just start getting used (as if by magic)
  after a short period (by default, 60 seconds).

* To add nodes:
    * go to the elasticache console; find your memcached cluster, and click on the 
      "1 node"  link, in the middle (it's an awful piece of UI)
    * Once you have the list of nodes, click 'Add Node'
    * add one or two nodes (not too many); let ElastiCache choose which AZs to put them
      in
    * It'll take a few minutes to add the new nodes; once done, you can delete
      the original node and verify that the PHP page still works.

### Part 3 - monitoring

* You can browse to individual nodes in the console and see CloudWatch metrics for the
  nodes -- perhaps the only one that'll give you much information for this demo is the
  current items count; most of the others only become useful when you're running
  ElastiCache at scale.

### Part 3 - cleanup

* Please delete clusters and cloudformation stacks when you're done.
