const { DynamoDBTableUtil } = require('../src/DynamoDBTableUtil')
const uuid = require('uuid/v1')
// ddb config options to run local
const config = {
  convertEmptyValues: true,
  endpoint: 'localhost:8000',
  sslEnabled: false,
  region: 'local-env'
}

const ddbTableUtil = new DynamoDBTableUtil('users', config)
describe('DynamoDBTableUtil', () => {
  beforeEach(() => {
    jest.setTimeout(5000)
  }) // beforeEach
  // constructor
  xdescribe('constructor', () => {
    test('should return DynamoDBTableUtil instance type, when valid arguments passed', async () => {
      expect.assertions(1)
      const validDDBUtilObj = new DynamoDBTableUtil('users', config)
      await expect(validDDBUtilObj).toBeInstanceOf(DynamoDBTableUtil)
    }) // test
    test('should throw an error, when null passed as table name', async () => {
      expect.assertions(1)
      async function test () {
        const t = new DynamoDBTableUtil(null, config)
        console.log(`t = ${t}`)
      }
      await expect(test()).rejects.toThrowError()
    }) // test
  }) // describe('constructor')
  // init
  xdescribe('init', () => {
    test('should return valid DynamoDBTableUtil object, when valid arguments passed', async () => {
      expect.assertions(1)
      const ddbTableUtilObj = await ddbTableUtil.init()
      await expect(ddbTableUtilObj).toMatchObject(ddbTableUtil)
    }) // test
    test('should throw an error, when non-existing table name is passed during object construction time', async () => {
      expect.assertions(1)
      const invalidDDBTableUtilObj = new DynamoDBTableUtil('users-invalid', config)
      await expect(invalidDDBTableUtilObj.init()).rejects.toThrowError(Error)
    }) // test
  }) // describe('init')
  // createNewItem
  xdescribe('createNewItem', () => {
    test('should create item successfully, when valid arguments passed', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe' }
      await ddbTableUtil.createNewItem(userItem)
      const { Item } = await ddbTableUtil.docClient.get({ TableName: 'users', Key: { id: itemPkValue } }).promise()
      console.log(`Item = ${JSON.stringify(Item)}`)
      await expect(Item).toEqual(userItem)
    }) // test
    test('should throw an error, when invalid userItem passed', async () => {
      expect.assertions(1)
      const userItem = { id: '', fName: 'John', lName: 'Doe' }
      await expect(ddbTableUtil.createNewItem(userItem)).rejects.toThrowError('Invalid attribute value type')
    }) // test
    test('should throw an error, when trying to create the similar item which already exist', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe' }
      await ddbTableUtil.createNewItem(userItem)
      // new item to overwrite
      const updatedItem = { id: itemPkValue, fName: 'Maria', lName: 'Bose' }
      await expect(ddbTableUtil.createNewItem(updatedItem)).rejects.toThrowError('The conditional request failed')
    }) // test
  }) // describe('createNewItem')
  // createNewOrReplaceItem
  xdescribe('createNewOrReplaceItem', () => {
    test('should create item successfully, when valid arguments passed', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe' }
      await ddbTableUtil.createNewOrReplaceItem(userItem)
      const { Item } = await ddbTableUtil.docClient.get({ TableName: 'users', Key: { id: itemPkValue } }).promise()
      console.log(`Item = ${JSON.stringify(Item)}`)
      await expect(Item).toEqual(userItem)
    }) // test
    test('should throw an error, when invalid userItem passed', async () => {
      expect.assertions(1)
      const userItem = { id: '', fName: 'John', lName: 'Doe' }
      await expect(ddbTableUtil.createNewOrReplaceItem(userItem)).rejects.toThrowError('Invalid attribute value type')
    }) // test
    test('should replace an existing item, when trying to create the similar item which already exist', async () => {
      expect.assertions(2)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe' }
      await ddbTableUtil.createNewOrReplaceItem(userItem)
      // overwrite with new item data
      const updatedItem = { id: itemPkValue, fName: 'Maria', lName: 'Bose' }
      const { Attributes } = await ddbTableUtil.createNewOrReplaceItem(updatedItem) // overwrite
      await expect(Attributes).toEqual(userItem)
      const { Item } = await ddbTableUtil.docClient.get({ TableName: 'users', Key: { id: itemPkValue } }).promise()
      await expect(Item).toEqual(updatedItem)
    }) // test
  }) // describe('createNewOrReplaceItem')
  // getItem
  xdescribe('getItem', () => {
    test('should get an item, when valid arguments passed', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe' }
      await ddbTableUtil.createNewItem(userItem) // first, create an item
      const dataItem = await ddbTableUtil.getItem(itemPkValue)
      await expect(dataItem).toEqual(userItem)
    }) // test
    test('should return null, when trying to get non-existing item', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const dataItem = await ddbTableUtil.getItem(itemPkValue)
      await expect(dataItem).toEqual(null)
    }) // test
    test('should throw an error, when null-item-id passed as argument', async () => {
      expect.assertions(1)
      await expect(ddbTableUtil.getItem(null)).rejects.toThrowError(Error)
    }) // test
  }) // describe('getItem')
  // findOrCreateItem
  xdescribe('findOrCreateItem', () => {
    test('should return newly created item, when trying to find non-existing item', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const newItem = { id: itemPkValue, fName: 'John', lName: 'Doe' }
      const dataItem = await ddbTableUtil.findOrCreateItem(newItem)
      console.log(`dataItem = ${JSON.stringify(dataItem)}`)
      await expect(dataItem).toEqual(newItem)
    }) // test
    test('should return fetched item, when trying to find existing item', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const newItem = { id: itemPkValue, fName: 'John', lName: 'Doe' }
      // create item, first
      await ddbTableUtil.createNewItem(newItem)
      // try to find/create item
      const dataItem = await ddbTableUtil.findOrCreateItem(newItem)
      console.log(`dataItem = ${JSON.stringify(dataItem)}`)
      await expect(dataItem).toEqual(newItem)
    }) // test
    test('should throw an error, when trying to find/create item with invalid pk-attribute-name', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const newItem = { idInvalid: itemPkValue, fName: 'John', lName: 'Doe' }
      await expect(ddbTableUtil.findOrCreateItem(newItem)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when trying to find/create item with invalid pk-attribute-value', async () => {
      expect.assertions(1)
      const newItem = { idInvalid: null, fName: 'John', lName: 'Doe' }
      await expect(ddbTableUtil.findOrCreateItem(newItem)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when trying to find/create item with invalid pk-attribute-value type', async () => {
      expect.assertions(1)
      const itemPkValue = 123.45
      const newItem = { id: itemPkValue, fName: 'John', lName: 'Doe' }
      await expect(ddbTableUtil.findOrCreateItem(newItem)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when trying to find/create null item', async () => {
      expect.assertions(1)
      await expect(ddbTableUtil.findOrCreateItem(null)).rejects.toThrowError(Error)
    }) // test
  }) // describe('findOrCreateItem')
  // updateItemByAppendingList
  xdescribe('updateItemByAppendingList', () => {
    test('should return updated item with list appended, when trying to append list to the existing list of item-attribute', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe', orgsNames: ['Apple', 'Microsoft'] }
      // first create an item
      await ddbTableUtil.createNewItem(userItem)
      // update userItem json by appending more elements into 'orgsNames' list
      const orgNameItemsToAppend = ['Google', 'Amazon']
      const updatedList = userItem.orgsNames.concat(orgNameItemsToAppend)
      userItem.orgsNames = updatedList
      console.log(`userItem = ${JSON.stringify(userItem)}`)
      const updatedItem = await ddbTableUtil.updateItemByAppendingList(itemPkValue, 'orgsNames', orgNameItemsToAppend)
      console.log(`updatedItem = ${JSON.stringify(updatedItem)}`)
      await expect(updatedItem).toEqual(userItem)
    }) // test
    test('should return updated item adding attribute and list appended to added-attribute, when trying to append list to non-existing item-attribute ', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe' } // 'orgsNames' don't exist
      // first create an item
      await ddbTableUtil.createNewItem(userItem)
      // add new item-attribute having list
      const orgNameItemsToAppend = ['Google', 'Amazon']
      userItem.orgsNames = orgNameItemsToAppend
      console.log(`userItem = ${JSON.stringify(userItem)}`)
      const updatedItem = await ddbTableUtil.updateItemByAppendingList(itemPkValue, 'orgsNames', orgNameItemsToAppend)
      console.log(`updatedItem = ${JSON.stringify(updatedItem)}`)
      await expect(updatedItem).toEqual(userItem)
    }) // test
    test('should add a new item to the table if it does not already exist, when trying to append list to non-existing item', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      // add new item-attribute having list
      const orgNameItemsToAppend = ['Google', 'Amazon']
      const updatedItem = await ddbTableUtil.updateItemByAppendingList(itemPkValue, 'orgsNames', orgNameItemsToAppend)
      console.log(`updatedItem = ${JSON.stringify(updatedItem)}`)
      // get added item
      const fetchedItem = await ddbTableUtil.getItem(itemPkValue)
      console.log(`fetchedItem = ${JSON.stringify(fetchedItem)}`)
      await expect(updatedItem).toEqual(fetchedItem)
    }) // test
    test('should return updated item with list appended, when trying to append number-type-list to the existing string-type-list of item-attribute', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe', orgsNames: ['Apple', 'Microsoft'] }
      // first create an item
      await ddbTableUtil.createNewItem(userItem)
      // update userItem json by appending more elements into 'orgsNames' list
      const orgNameItemsToAppend = [1001, 2001]
      const updatedList = userItem.orgsNames.concat(orgNameItemsToAppend)
      userItem.orgsNames = updatedList
      console.log(`userItem = ${JSON.stringify(userItem)}`)
      const updatedItem = await ddbTableUtil.updateItemByAppendingList(itemPkValue, 'orgsNames', orgNameItemsToAppend)
      console.log(`updatedItem = ${JSON.stringify(updatedItem)}`)
      await expect(updatedItem).toEqual(userItem)
    }) // test
    test('should throw an error, when trying to update item in non-existent table', async () => {
      expect.assertions(1)
      const invalidTableUtil = new DynamoDBTableUtil('users-invalid', config)
      const itemPkValue = uuid()
      await expect(invalidTableUtil.updateItemByAppendingList(itemPkValue, 'orgsNames', ['Apple', 'Google'])).rejects.toThrowError('Cannot do operations on a non-existent table')
    }) // test
    test('should add non-existing attribute in item and assign list to it, when trying to append list to the non-existing item-attribute', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe', orgsNames: ['Apple', 'Microsoft'] }
      // first create an item
      await ddbTableUtil.createNewItem(userItem)
      // update userItem json by appending more elements into 'orgsNames' list
      const orgNameItemsToAppend = ['Google', 'Amazon']
      userItem.orgsNamesNonExisting = orgNameItemsToAppend
      console.log(`userItem = ${JSON.stringify(userItem)}`)
      const updatedItem = await ddbTableUtil.updateItemByAppendingList(itemPkValue, 'orgsNamesNonExisting', orgNameItemsToAppend)
      console.log(`updatedItem = ${JSON.stringify(updatedItem)}`)
      await expect(updatedItem).toEqual(userItem)
    }) // test
    test('should throw an error, when trying to append null list', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe', orgsNames: ['Apple', 'Microsoft'] }
      // first create an item
      await ddbTableUtil.createNewItem(userItem)
      await expect(ddbTableUtil.updateItemByAppendingList(itemPkValue, 'orgsNames', null)).rejects.toThrowError('invalid data')
    }) // test
    test('should throw an error, when null item pk value is passed', async () => {
      expect.assertions(1)
      await expect(ddbTableUtil.updateItemByAppendingList(null, 'orgsNames', ['Apple', 'Microsoft'])).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when non-string type item pk value is passed', async () => {
      expect.assertions(1)
      const itemPkValue = 1002
      await expect(ddbTableUtil.updateItemByAppendingList(itemPkValue, 'orgsNames', ['Apple', 'Microsoft'])).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when non-string type item pk value is passed', async () => {
      expect.assertions(1)
      const itemPkValue = true
      await expect(ddbTableUtil.updateItemByAppendingList(itemPkValue, 'orgsNames', ['Apple', 'Microsoft'])).rejects.toThrowError(Error)
    }) // test
  }) // describe('updateItemByAppendingList')
  // updateItemByRemovingList
  describe('updateItemByRemovingList', () => {
    test('should return updated item with list removed, when trying to remove list from the existing list of item-attribute', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe', orgsNames: ['Apple', 'Microsoft', 'Google', 'Amazon'] }
      // first create an item
      await ddbTableUtil.createNewItem(userItem)
      // elements to remove
      const orgNameItemsToRemove = ['Google', 'Amazon']
      // const updatedList = userItem.orgsNames.splice()
      userItem.orgsNames = ['Apple', 'Microsoft']
      console.log(`userItem = ${JSON.stringify(userItem)}`)
      const updatedItem = await ddbTableUtil.updateItemByRemovingList(itemPkValue, 'orgsNames', orgNameItemsToRemove)
      console.log(`updatedItem = ${JSON.stringify(updatedItem)}`)
      await expect(updatedItem).toEqual(userItem)
    }) // test
    test('should return updated item with empty list, when trying to remove all items from the existing list of item-attribute', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe', orgsNames: ['Apple', 'Microsoft', 'Google', 'Amazon'] }
      // first create an item
      await ddbTableUtil.createNewItem(userItem)
      // elements to remove
      const orgNameItemsToRemove = ['Apple', 'Microsoft', 'Google', 'Amazon']
      // const updatedList = userItem.orgsNames.splice()
      userItem.orgsNames = []
      console.log(`userItem = ${JSON.stringify(userItem)}`)
      const updatedItem = await ddbTableUtil.updateItemByRemovingList(itemPkValue, 'orgsNames', orgNameItemsToRemove)
      console.log(`updatedItem = ${JSON.stringify(updatedItem)}`)
      await expect(updatedItem).toEqual(userItem)
    }) // test
    test('should return updated item intact, when trying to remove list of items which do not exist in the item-attribute list', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe', orgsNames: ['Apple', 'Microsoft', 'Google', 'Amazon'] }
      // first create an item
      await ddbTableUtil.createNewItem(userItem)
      // elements to remove
      const orgNameItemsToRemove = ['ABC', 'XYZ']
      console.log(`userItem = ${JSON.stringify(userItem)}`)
      const updatedItem = await ddbTableUtil.updateItemByRemovingList(itemPkValue, 'orgsNames', orgNameItemsToRemove)
      console.log(`updatedItem = ${JSON.stringify(updatedItem)}`)
      await expect(updatedItem).toEqual(userItem)
    }) // test
    test('should return updated item intact, when trying to remove list of different-types which do not exist in the item-attribute list', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe', orgsNames: ['Apple', 'Microsoft', 'Google', 'Amazon'] }
      // first create an item
      await ddbTableUtil.createNewItem(userItem)
      // elements to remove
      const orgNameItemsToRemove = [1001, 2002]
      console.log(`userItem = ${JSON.stringify(userItem)}`)
      const updatedItem = await ddbTableUtil.updateItemByRemovingList(itemPkValue, 'orgsNames', orgNameItemsToRemove)
      console.log(`updatedItem = ${JSON.stringify(updatedItem)}`)
      await expect(updatedItem).toEqual(userItem)
    }) // test
    test('should throw an error, when trying to update item in non-existent table', async () => {
      expect.assertions(1)
      const invalidTableUtil = new DynamoDBTableUtil('users-invalid', config)
      const itemPkValue = uuid()
      await expect(invalidTableUtil.updateItemByRemovingList(itemPkValue, 'orgsNames', ['Apple', 'Google'])).rejects.toThrowError('Cannot do operations on a non-existent table')
    }) // test
    test('should throw an error, when trying to remove null list', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe', orgsNames: ['Apple', 'Microsoft'] }
      // first create an item
      await ddbTableUtil.createNewItem(userItem)
      await expect(ddbTableUtil.updateItemByRemovingList(itemPkValue, 'orgsNames', null)).rejects.toThrowError('invalid data')
    }) // test
    test('should throw an error, when trying to remove JSON object', async () => {
      expect.assertions(1)
      const itemPkValue = uuid()
      const userItem = { id: itemPkValue, fName: 'John', lName: 'Doe', orgsNames: ['Apple', 'Microsoft'] }
      // first create an item
      await ddbTableUtil.createNewItem(userItem)
      await expect(ddbTableUtil.updateItemByRemovingList(itemPkValue, 'orgsNames', { orgName1: 'Apple', orgName2: 'Microsoft' })).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when null item pk value is passed', async () => {
      expect.assertions(1)
      await expect(ddbTableUtil.updateItemByRemovingList(null, 'orgsNames', ['Apple', 'Microsoft'])).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when non-string type item pk value is passed', async () => {
      expect.assertions(1)
      const itemPkValue = 1002
      await expect(ddbTableUtil.updateItemByRemovingList(itemPkValue, 'orgsNames', ['Apple', 'Microsoft'])).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when non-string type item pk value is passed', async () => {
      expect.assertions(1)
      const itemPkValue = true
      await expect(ddbTableUtil.updateItemByRemovingList(itemPkValue, 'orgsNames', ['Apple', 'Microsoft'])).rejects.toThrowError(Error)
    }) // test
  }) // describe('updateItemByRemovingList')
}) // describe('DynamoDBTableUtil')
