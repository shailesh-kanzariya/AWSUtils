const { SimpleDynamoDBUtil } = require('../src/SimpleDynamoDBUtil')
const usersTableConfigs = require('./../jest-dynamodb-config').tables[0]
// ddb config options to run local
const config = {
  convertEmptyValues: true,
  endpoint: 'localhost:8000',
  sslEnabled: false,
  region: 'region-local'
}
const simpleDDBUtil = new SimpleDynamoDBUtil(config)
describe('SimpleDynamoDBUtil', () => {
  beforeEach(() => {
    jest.setTimeout(5000)
  }) // beforeEach
  // constructor
  describe('constructor', () => {
    test('should return SimpleDynamoDBUtil instance type, when valid arguments passed', async () => {
      expect.assertions(1)
      const validDDBUtilObj = new SimpleDynamoDBUtil(config)
      await expect(validDDBUtilObj).toBeInstanceOf(SimpleDynamoDBUtil)
    }) // test
    test('should return SimpleDynamoDBUtil instance type, when no configs passed', async () => {
      expect.assertions(1)
      const validDDBUtilObj = new SimpleDynamoDBUtil(config)
      await expect(validDDBUtilObj).toBeInstanceOf(SimpleDynamoDBUtil)
    }) // test
  }) // describe('constructor')
  // createNewItemInTable
  describe('createNewItemInTable', () => {
    test('should create item successfully, when valid arguments passed', async () => {
      expect.assertions(1)
      const pkValue = '1234'
      const userItem = { id: pkValue, hello: 'world' }
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      const { Item } = await simpleDDBUtil.docClient.get({ TableName: 'users', Key: { id: pkValue } }).promise()
      await expect(Item).toEqual(userItem)
    }) // test
    test('should throw an error, when non-existent table name passed', async () => {
      expect.assertions(1)
      const userItem = { id: '1', hello: 'world' }
      await expect(simpleDDBUtil.createNewItemInTable('users-invalid', userItem)).rejects.toThrowError('Cannot do operations on a non-existent table')
    }) // test
    test('should throw an error, when invalid userItem passed', async () => {
      expect.assertions(1)
      const userItem = { id: '', hello: 'world' }
      await expect(simpleDDBUtil.createNewItemInTable('users', userItem)).rejects.toThrowError('Invalid attribute value type')
    }) // test
    test('should overwrite existing item, when similar item already exist', async () => {
      expect.assertions(2)
      const userItem = { id: '100', hello: 'world' }
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      // new item to overwrite
      const updatedUserItem = { id: '100', hello: 'AWS' }
      const { Attributes } = await simpleDDBUtil.createNewItemInTable('users', updatedUserItem) // overwrite an existing item
      console.log(`old item = ${JSON.stringify(Attributes)}`)
      // get overwritten item
      const { Item } = await simpleDDBUtil.docClient.get({ TableName: 'users', Key: { id: '100' } }).promise()
      await expect(Item).toEqual(updatedUserItem)
      await expect(Attributes).toEqual(userItem)
    }) // test
    test('should prevent overwrite to existing item and throw an error', async () => {
      expect.assertions(1)
      const userItem = { id: '200', hello: 'world' }
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      // new item to overwrite
      const updatedUserItem = { id: '200', hello: 'AWS' }
      await expect(simpleDDBUtil.createNewItemInTable('users', updatedUserItem, false)).rejects.toThrowError('The conditional request failed')
    }) // test
  }) // describe('createNewItemInTable')
  // getTableInfo
  describe('getTableInfo', () => {
    test('should return information of the table, when valid arguments passed', async () => {
      expect.assertions(3)
      const tableInfo = await simpleDDBUtil.getTableInfo('users')
      await expect(tableInfo.Table.KeySchema).toEqual(usersTableConfigs.KeySchema)
      await expect(tableInfo.Table.TableName).toEqual(usersTableConfigs.TableName)
      await expect(tableInfo.Table.AttributeDefinitions).toEqual(usersTableConfigs.AttributeDefinitions)
    }) // test
    test('should throw an error, when non-existent table name passed', async () => {
      expect.assertions(1)
      await expect(simpleDDBUtil.getTableInfo('users-invalid')).rejects.toThrowError('Cannot do operations on a non-existent table')
    }) // test
    test('should throw an error, when \'null\' passed as an argument', async () => {
      expect.assertions(1)
      await expect(simpleDDBUtil.getTableInfo(null)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when no argument passed', async () => {
      expect.assertions(1)
      await expect(simpleDDBUtil.getTableInfo()).rejects.toThrowError(Error)
    }) // test
  }) // describe('getTableInfo')
  // getKeySchemaForTable
  describe('getKeySchemaForTable', () => {
    test('should return keyschema of the table, when valid arguments passed', async () => {
      expect.assertions(1)
      const tableKeySchema = await simpleDDBUtil.getKeySchemaForTable('users')
      await expect(tableKeySchema).toEqual(usersTableConfigs.KeySchema)
    }) // test
    test('should throw an error, when non-existent table name passed', async () => {
      expect.assertions(1)
      await expect(simpleDDBUtil.getKeySchemaForTable('users-invalid')).rejects.toThrowError('Cannot do operations on a non-existent table')
    }) // test
    test('should throw an error, when \'null\' passed as an argument', async () => {
      expect.assertions(1)
      await expect(simpleDDBUtil.getKeySchemaForTable(null)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when no argument passed', async () => {
      expect.assertions(1)
      await expect(simpleDDBUtil.getKeySchemaForTable()).rejects.toThrowError(Error)
    }) // test
  }) // describe('getKeySchemaForTable')
  // getHashKeyAttributeNameForTable
  describe('getHashKeyAttributeNameForTable', () => {
    test('should return hashkey attribute name of the table, when valid arguments passed', async () => {
      expect.assertions(1)
      const hashKeyAttributeName = await simpleDDBUtil.getHashKeyAttributeNameForTable('users')
      await expect(hashKeyAttributeName).toEqual(usersTableConfigs.KeySchema[0].AttributeName)
    }) // test
    test('should throw an error, when non-existent table name passed', async () => {
      expect.assertions(1)
      await expect(simpleDDBUtil.getHashKeyAttributeNameForTable('users-invalid')).rejects.toThrowError('Cannot do operations on a non-existent table')
    }) // test
    test('should throw an error, when no argument passed', async () => {
      expect.assertions(1)
      await expect(simpleDDBUtil.getHashKeyAttributeNameForTable()).rejects.toThrowError(Error)
    }) // test
  }) // describe('getHashKeyAttributeNameForTable')
  // getRangeKeyAttributeNameForTable
  describe('getRangeKeyAttributeNameForTable', () => {
    test('should return rangekey attribute name of the table, when valid arguments passed', async () => {
      expect.assertions(1)
      const rangeKeyAttributeName = await simpleDDBUtil.getRangeKeyAttributeNameForTable('users-with-pk-and-sk')
      console.log(`rangeKeyAttributeName = ${rangeKeyAttributeName}`)
      const usersTableWithPkAndSk = require('./../jest-dynamodb-config').tables[1]
      await expect(rangeKeyAttributeName).toEqual(usersTableWithPkAndSk.KeySchema[1].AttributeName)
    }) // test
    test('should throw an error, when non-existent table name passed', async () => {
      expect.assertions(1)
      await expect(simpleDDBUtil.getRangeKeyAttributeNameForTable('users-invalid')).rejects.toThrowError('Cannot do operations on a non-existent table')
    }) // test
    test('should throw an error, when no argument passed', async () => {
      expect.assertions(1)
      await expect(simpleDDBUtil.getRangeKeyAttributeNameForTable()).rejects.toThrowError(Error)
    }) // test
    test('should return null, when no range key exist in the table', async () => {
      expect.assertions(1)
      const rangeKeyAttributeName = await simpleDDBUtil.getRangeKeyAttributeNameForTable('users-no-range-key')
      await expect(rangeKeyAttributeName).toEqual(null)
    }) // test
  }) // describe('getRangeKeyAttributeNameForTable')
  // getItemFromTable
  describe('getItemFromTable', () => {
    test('should return valid item, when all valid arguments passed', async () => {
      expect.assertions(1)
      const itemPkValue = '300'
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe' }
      await simpleDDBUtil.createNewItemInTable('users', userItem) // create an item first
      // get item, now
      const receivedItem = await simpleDDBUtil.getItemFromTable('users', itemPkValue)
      await expect(receivedItem).toEqual(userItem)
    }) // test
    test('should return null, when trying to get non-existing item', async () => {
      expect.assertions(1)
      const itemPkValue = '12345'
      const receivedItem = await simpleDDBUtil.getItemFromTable('users', itemPkValue)
      console.log(`receivedItem = ${receivedItem}`)
      await expect(receivedItem).toEqual(null)
    }) // test
    test('should throw an error, when non-existent table name passed', async () => {
      expect.assertions(1)
      const itemPkValue = '300'
      await expect(simpleDDBUtil.getItemFromTable('users-invalid', itemPkValue)).rejects.toThrowError('Cannot do operations on a non-existent table')
    }) // test
    test('should throw an error, when no argument passed', async () => {
      expect.assertions(1)
      await expect(simpleDDBUtil.getItemFromTable()).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when no item-it passed', async () => {
      expect.assertions(1)
      await expect(simpleDDBUtil.getItemFromTable('users')).rejects.toThrowError(Error)
    }) // test
  }) // describe('getItemFromTable')
}) // describe('SimpleDynamoDBUtil')
