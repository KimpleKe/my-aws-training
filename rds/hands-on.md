# REA AWS Training - RDS Hands On

## Part 1 - Create RDS instance

* Create a VPC security group that permits inbound TCP on port 3306 from anywhere; name it as
  your RDS security group (so you'll recognise it)
* Using the console, choose a region and launch an RDS instance.
    * Select the MySQL engine
    * Select NO that the instance will not be used in production -- it'll be a bit slower to
      use, and a bit less resilient to failures, but this is training
    * Choose a DB instance class that's not too big
    * Set Multi-AZ deployment to 'yes'
    * Set allocated storage to 5GB -- any bigger, and it'll take forever to create
    * Provisioned IOPS == 'no'
    * Choose the security group you created above
    * Create a database name (use your imagination)
    * Select '1' for the backup retention period -- this is required for read replicas later

* Note if you want to modify any parameters after creating the instance, you can -- but look
  at that weensy checkbox at the bottom of the page which says 'Apply Immediately'. If you
  don't check that, changes won't get applied until the next maintenance window.

## Part 2 - Put in some data

* Look at the DB Instances page and find the endpoint for your RDS
* Look up the IP address of the endpoint -- you'll use this in part 3
* If you don't have MySQL command-line client locally, spin up an Amazon Linux AMI and `yum
  install -y mysql`. You will then have to log in to that EC2 instance and run the
  rest of the exercise from the command-line on that instance.

* Connect to your new RDS instance using the client:

    ```
    mysql -u <username you chose> -h <endpoint hostname> -p
    Enter password: <password you chose>
    ```

* Take note of the server ID and UUID:

    ```
    mysql> show global variables like 'server%';
    ```

* Change to the database name you created:

    ```
    mysql> use <database-name-you-chose>;
    ```

* Create a table:

    ```
    mysql> create table testtable (testcol int);
    ```

* Put in some data:

    ```
    mysql> insert into testtable values (1), (2), (3);
    ```

## Part 3 - failover

* Reboot your instance. When you're prompted "are you sure?" you have a checkbox to reboot
  with failover, meaning that the other AZ instance will take over.
* Do an IP address lookup of the endpoint hostname -- see how it's changed?
* Reconnect to the DB; verify that the data you inserted on the other node is there:

    ```
    mysql> select * from testtable;
    ```

* Check the server ID and UUID -- are they different from before?:

    ```
    mysql> show global variables like 'server%';
    ```

## Part 4 - Read Replica

* In the DB Instances display, select your instance and, under 'Instance Actions', choose
  'Create Read Replica'
    * Set the instance class, DB instance identifier (eg mydb-ro), destination region (BEWARE
      replication lag can be unpredictable cross-region), and click 'Create'
* Creating the read replica, especially in another region, can take A Long Time. If it happens
  to finish in a timely manner, you can use the same mysql query mechanism above to connect to
  the read replica and select values from the table you created, to verify that data is indeed
  being replicated.

## Part 4 - cleanup

* Delete your RDS instances when you're done. Don't take a final snapshot.
