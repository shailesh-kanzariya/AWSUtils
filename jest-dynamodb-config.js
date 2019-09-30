module.exports = {
  tables: [
    {
      TableName: 'users',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }, { AttributeName: 'email', KeyType: 'RANGE' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }, { AttributeName: 'email', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
    },
    {
      TableName: 'users-no-range-key',
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
    }
  ]
}
