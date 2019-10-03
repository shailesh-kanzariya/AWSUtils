const { SimpleDynamoDBUtil } = require('../src/SimpleDynamoDBUtil')
const uuid = require('uuid/v1')
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
  xdescribe('constructor', () => {
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
  xdescribe('createNewItemInTable', () => {
    test('should create item successfully, when valid arguments passed', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, hello: 'world' }
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      const { Item } = await simpleDDBUtil.docClient.get({ TableName: 'users', Key: { id: itemPkValue } }).promise()
      await expect(Item).toEqual(userItem)
    }) // test
    test('should throw an error, when non-existent table name passed', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, hello: 'world' }
      await expect(simpleDDBUtil.createNewItemInTable('users-invalid', userItem)).rejects.toThrowError('Cannot do operations on a non-existent table')
    }) // test
    test('should throw an error, when invalid userItem passed', async () => {
      expect.assertions(1)
      const userItem = { id: '', hello: 'world' }
      await expect(simpleDDBUtil.createNewItemInTable('users', userItem)).rejects.toThrowError('Invalid attribute value type')
    }) // test
    test('should overwrite existing item, when similar item already exist', async () => {
      expect.assertions(2)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, hello: 'world' }
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      // new item to overwrite
      const updatedUserItem = { id: itemPkValue, hello: 'AWS' }
      const oldItem = await simpleDDBUtil.createNewItemInTable('users', updatedUserItem) // overwrite an existing item
      console.log(`old item = ${JSON.stringify(oldItem)}`)
      // get overwritten item
      const { Item } = await simpleDDBUtil.docClient.get({ TableName: 'users', Key: { id: itemPkValue } }).promise()
      await expect(Item).toEqual(updatedUserItem)
      await expect(oldItem).toEqual(userItem)
    }) // test
    test('should prevent overwrite to existing item and throw an error', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, hello: 'world' }
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      // new item to overwrite
      const updatedUserItem = { id: itemPkValue, hello: 'AWS' }
      await expect(simpleDDBUtil.createNewItemInTable('users', updatedUserItem, false)).rejects.toThrowError('The conditional request failed')
    }) // test
  }) // describe('createNewItemInTable')
  // getTableInfo
  xdescribe('getTableInfo', () => {
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
  xdescribe('getKeySchemaForTable', () => {
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
  xdescribe('getHashKeyAttributeNameForTable', () => {
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
  xdescribe('getRangeKeyAttributeNameForTable', () => {
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
  xdescribe('getItemFromTable', () => {
    test('should return valid item, when all valid arguments passed', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe' }
      await simpleDDBUtil.createNewItemInTable('users', userItem) // create an item first
      // get item, now
      const receivedItem = await simpleDDBUtil.getItemFromTable('users', itemPkValue)
      await expect(receivedItem).toEqual(userItem)
    }) // test
    test('should return null, when trying to get non-existing item', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const receivedItem = await simpleDDBUtil.getItemFromTable('users', itemPkValue)
      console.log(`receivedItem = ${receivedItem}`)
      await expect(receivedItem).toEqual(null)
    }) // test
    test('should throw an error, when non-existent table name passed', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      // first create valid item in table
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe' }
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      // try to get that item in invalid tablename
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
  // updateItemInTableByAppendingList
  describe('updateItemInTableByAppendingList', () => {
    test('should return updated item with list appended, when trying to append list to the existing list of item-attribute', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe', orgsNames: ['Apple', 'Microsoft'] }
      // first create an item
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      // update userItem json by appending more elements into 'orgsNames' list
      const orgNameItemsToAppend = ['Google', 'Amazon']
      const updatedList = userItem.orgsNames.concat(orgNameItemsToAppend)
      userItem.orgsNames = updatedList
      console.log(`userItem = ${JSON.stringify(userItem)}`)
      const updatedItem = await simpleDDBUtil.updateItemInTableByAppendingList('users', itemPkValue, 'orgsNames', orgNameItemsToAppend)
      console.log(`updatedItem = ${JSON.stringify(updatedItem)}`)
      await expect(updatedItem).toEqual(userItem)
    }) // test
    test('should return updated item with list appended, when trying to append list to non-existing item-attribute ', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe' } // 'orgsNames' don't exist
      // first create an item
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      // add new item-attribute having list
      const orgNameItemsToAppend = ['Google', 'Amazon']
      userItem.orgsNames = orgNameItemsToAppend
      console.log(`userItem = ${JSON.stringify(userItem)}`)
      const updatedItem = await simpleDDBUtil.updateItemInTableByAppendingList('users', itemPkValue, 'orgsNames', orgNameItemsToAppend)
      console.log(`updatedItem = ${JSON.stringify(updatedItem)}`)
      await expect(updatedItem).toEqual(userItem)
    }) // test
    test('should add a new item to the table if it does not already exist, when trying to append list to non-existing item', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      // add new item-attribute having list
      const orgNameItemsToAppend = ['Google', 'Amazon']
      const updatedItem = await simpleDDBUtil.updateItemInTableByAppendingList('users', itemPkValue, 'orgsNames', orgNameItemsToAppend)
      console.log(`updatedItem = ${JSON.stringify(updatedItem)}`)
      // get added item
      const fetchedItem = await simpleDDBUtil.getItemFromTable('users', itemPkValue)
      console.log(`fetchedItem = ${JSON.stringify(fetchedItem)}`)
      await expect(updatedItem).toEqual(fetchedItem)
    }) // test
    test('should return updated item with list appended, when trying to append number-type-list to the existing string-type-list of item-attribute', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe', orgsNames: ['Apple', 'Microsoft'] }
      // first create an item
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      // update userItem json by appending more elements into 'orgsNames' list
      const orgNameItemsToAppend = [1001, 2001]
      const updatedList = userItem.orgsNames.concat(orgNameItemsToAppend)
      userItem.orgsNames = updatedList
      console.log(`userItem = ${JSON.stringify(userItem)}`)
      const updatedItem = await simpleDDBUtil.updateItemInTableByAppendingList('users', itemPkValue, 'orgsNames', orgNameItemsToAppend)
      console.log(`updatedItem = ${JSON.stringify(updatedItem)}`)
      await expect(updatedItem).toEqual(userItem)
    }) // test
    test('should throw an error, when trying to update item in non-existent table', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      await expect(simpleDDBUtil.updateItemInTableByAppendingList('users-invalid', itemPkValue, 'orgsNames', ['Apple', 'Google'])).rejects.toThrowError('Cannot do operations on a non-existent table')
    }) // test
    test('should add non-existing attribute in item and assign list to it, when trying to append list to the non-existing item-attribute', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe', orgsNames: ['Apple', 'Microsoft'] }
      // first create an item
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      // update userItem json by appending more elements into 'orgsNames' list
      const orgNameItemsToAppend = ['Google', 'Amazon']
      userItem.orgsNamesNonExisting = orgNameItemsToAppend
      console.log(`userItem = ${JSON.stringify(userItem)}`)
      const updatedItem = await simpleDDBUtil.updateItemInTableByAppendingList('users', itemPkValue, 'orgsNamesNonExisting', orgNameItemsToAppend)
      console.log(`updatedItem = ${JSON.stringify(updatedItem)}`)
      await expect(updatedItem).toEqual(userItem)
    }) // test
    test('should throw an error, when trying to append null list', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe', orgsNames: ['Apple', 'Microsoft'] }
      // first create an item
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      await expect(simpleDDBUtil.updateItemInTableByAppendingList('users', itemPkValue, 'orgsNames', null)).rejects.toThrowError('invalid data')
    }) // test
    test('should throw an error, when null item pk value is passed', async () => {
      expect.assertions(1)
      await expect(simpleDDBUtil.updateItemInTableByAppendingList('users', null, 'orgsNames', ['Apple', 'Microsoft'])).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when non-string type item pk value is passed', async () => {
      expect.assertions(1)
      const itemPkValue = 1002
      await expect(simpleDDBUtil.updateItemInTableByAppendingList('users', itemPkValue, 'orgsNames', ['Apple', 'Microsoft'])).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when non-string type item pk value is passed', async () => {
      expect.assertions(1)
      const itemPkValue = true
      await expect(simpleDDBUtil.updateItemInTableByAppendingList('users', itemPkValue, 'orgsNames', ['Apple', 'Microsoft'])).rejects.toThrowError(Error)
    }) // test
  }) // describe('updateItemInTableByAppendingList')
}) // describe('SimpleDynamoDBUtil')
