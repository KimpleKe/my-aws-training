# REA AWS Training -- Redshift Hands-On

## Part 1 - create redshift cluster

* Create a new VPC security group and permit inbound TCP on ports 5432-5439 from anywhere
* Using the console, create a new Redshift cluster in a region; if there's contention, you may
  have to switch to a less-used region
    * Name the cluster for yourself
    * Create a database called `tickit`
    * Leave the DB port as 5432
    * Create a master username and password -- remember them
    * Choose node type of dw2.large if available
    * Make it be a single-node cluster
    * Add your email address as a recipient of the cloudwatch alarm
    * Go with the defaults for the rest of it
* It'll take a little while to create the cluster -- if you click on the little magnifying
  glass next to the cluster name in the Clusters dashboard, you can see how it's going
* Once the cluster is created, Modify it via its details page -- set the security group to be
  the one you created at the start of this exercise

## Part 2 -- connecting to the cluster

* If you have a local postgres client, use it -- otherwise, something like an ODBC or JDBC
  client can be used, or you can create an EC2 instance (use the Amazon Linux AMI) and do `yum
  install -y postgres` to get yourself a command-line client
* Note the Endpoint property in the cluster details page
* connect using the postgres client and the master username/password you created above:
    `psql -h <endpoint name> -U <master-username> -p <endpoint-port> tickit`
* Congratulations -- you've connected to the redshift cluster

## Part 3 -- create a database user (optional for this training)

* database users have access to all databases in a cluster. If you don't want to give out the
  master user credentials (a wise idea), you should create a database user. Once you've
  connected to Redshift (as above), issue the command:
  `create user guest password 'Abcd1234';`
* You can choose a different password, or username of course; just remember what it is.

## Part 4 -- poke about

* If you want to see what tables exist in a default Redshift database, issue the command
  `SELECT * FROM PG_TABLE_DEF;` -- by default, it'll be a set of internal PostgreSQL tables
* Create a test table if you like -- `CREATE TABLE testtable (testcolumn int);`
* Examine the structure of your new table via `SELECT * FROM PG_TABLE_DEF WHERE TABLENAME =
  'testtable';`

## Part 5 -- load some sample data

* Execute commands from the `table-defs.sql` file via the `psql` command-line tool to create
  the sample tables:

  `tickit=# \i table-defs.sql`

* You should see 7 `CREATE TABLE` statements being printed
* You'll need to know the values of your `$AWS_ACCESS_KEY_ID`, `$AWS_SECRET_ACCESS_KEY` and
  `$AWS_SECURITY_TOKEN` -- use the command `env | grep AWS` to show them from the shell
  command-line and then hop back into psql once you know them
* Using the COPY command, ingest data directly from an AWS-provided sample data bucket --
  the documentation says that you must have your cluster in the same region, but cross-region
  ingestion was released on June 29th 2014, so huzzah!

    `tickit=# COPY users FROM 's3://rea-awstraining/tickit/allusers_pipe.txt' region
    'us-east-1' delimiter '|' credentials
    'aws_access_key_id=<YOUR_AWS_ACCESS_KEY>;aws_secret_access_key=<YOUR_AWS_SECRET_ACCESS_KEY>;token=<YOUR_AWS_SECURITY_TOKEN>';

    * Note that you have to plug in the values from the environment variables above.
    * Note also that your credentials must be valid for the entire duration of the copy
      command -- if they expire partway through, the copy will fail and you'll have to run it
      again with credentials that remain valid for the entire load duration.
* Do the same load again and again, this time for the tables:
    * `venue` from `s3://rea-awstraining/tickit/venue_pipe.txt`
    * `category` from `s3://rea-awstraining/tickit/category_pipe.txt`
    * `date` from `s3://rea-awstraining/tickit/date2008_pipe.txt`
    * `listing` from `s3://rea-awstraining/tickit/listings_pipe.txt`
* The next two copies need a specific timeformat, and `sales` uses a different delimiter
  so instead use:

    tickit=# COPY event FROM 's3://rea-awstraining/tickit/allevents_pipe.txt' REGION
    'us-east-1' DELIMITER '|' CREDENTIALS '<as above>' TIMEFORMAT 'YYYY-MM-DD HH:MI:SS';

    tickit=# COPY sales FROM 's3://rea-awstraining/tickit/sales_tab.txt' REGION
    'us-east-1' DELIMITER '\t' CREDENTIALS '<as above>' TIMEFORMAT 'MM/DD/YYYY HH:MI:SS';

* Verify the load results:

    tickit=# SELECT COUNT(*) FROM users;
    tickit=# SELECT COUNT(*) FROM venue;
    tickit=# SELECT COUNT(*) FROM category;
    tickit=# SELECT COUNT(*) FROM date;
    tickit=# SELECT COUNT(*) FROM event;
    tickit=# SELECT COUNT(*) FROM listing;
    tickit=# SELECT COUNT(*) FROM sales;

# Part 6 - an actual query

* It's an SQL query, so it's not really that exciting -- the creation of the cluster and
  ingestion of data direct from S3 across regions is the cool bit. But just in case you want
  to feel like you've achieved something (pardon my horrific SQL):

    ```sql
    SELECT DISTINCT firstname, lastname, eventname
    FROM users, event, sales
    WHERE users.userid = sales.buyerid AND sales.eventid = event.eventid
    ORDER BY eventname, lastname, firstname;
    ```


