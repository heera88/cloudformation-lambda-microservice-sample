## Introduction

> A microservice in AWS cloud that exposes two endpoints:

- `POST` /messages
- `GET` /messages/{hash_id}

## Architecture

Uses AWS Cloudformation to automate stack creation, which includes:

- API Gateway
- API Gateway Deployment
- IAM Roles
- Lambda function
- DynamoDB

## Design philosophies

- Automation
- Sheer Cloud based
- AutoScaling

## Endpoints
- `POST` /messages

> `curl -X POST -H "Content-Type: application/json" -d '{"message": "cool, you made it!"}' https://nl41blcqpc.execute-api.us-east-1.amazonaws.com/prod/messages`

- `GET` /messages/{hash_id}

> `curl https://nl41blcqpc.execute-api.us-east-1.amazonaws.com/prod/messages/521bcfcddc0bcf79d29377a9fd936491eb1de49d6b511f7e49f28b627b74d1dd`


## Scaling DynamoDB

1. Data partitioning or Sharding for even distribution of workload.

- Hash-Based partitioning: Dynamodb uses the partition key's value as an input to an internal hash function to ensure data is spread evenly across available paritions. Since sha256 digests have high cardinality, I have chosen digest as the partition key. DynamoDB's internal hash function will ensure even distribution.

2. Caching popular digests - We can cache popular hashIds to prevent read of unusually popular items from swamping partitions.

3. AutoScaling to dynamically adjust provisioned throughput capacity in response to traffic access patterns.

## Scaling the application

Since I am using AWS Lambda to process the requests from API gateway, AWS scales them automatically. Since code is stateless, lambda will dynamically allocate capacity to match the rate of incoming requests.

