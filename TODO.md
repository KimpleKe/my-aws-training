# TODO for training hands-on

## CHECK

* Limits in Sydney for
    * RDS
    * ElastiCache
    * DynamoDB
    * Kinesis

## REFORMAT

* Per-service modules

## ADD

* CloudTrail (via cloudtrailinator)
    * CloudWatch Logs

* Config (at least mention it)
* CloudSearch?
* CloudFront?
* Aurora
    * Caveats about Sydney
* CodeDeploy, CodePipeline, CodeCommit
* Service Catalog
* ECS?

## UPDATE

* VPC (Qing is doing this)
    * peering
    * default VPC
    * ClassicLink
* DynamoDB
    * Online indexing
        https://aws.amazon.com/blogs/aws/amazon-dynamodb-update-online-indexing-reserved-capacity-improvements/
    * secondary indexes - now scannable
    * better example
    * Streams
        http://aws.amazon.com/blogs/aws/dynamodb-streams-preview
* Elasticache
    * Redis 2.8.19
    * MultiAZ and auto failover for Redis
        http://aws.amazon.com/blogs/aws/elasticache-redis-multi-az
* RDS
    * Cache warming (5.6 buffer pool -> disk then reload on startup)
* Glacier
    * Data retrieval and audit policies
        http://aws.amazon.com/blogs/aws/data-retrieval-policies-audit-logging-glacier
