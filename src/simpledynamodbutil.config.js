const AWS_REGION_DEFAULT = 'us-east-2'
module.exports = {
  DynamoDB: {
    options: {
      region: AWS_REGION_DEFAULT,
      apiVersion: '2012-08-10'
    }
  }
}
