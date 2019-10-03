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
  describe('findOrCreateItem', () => {
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
}) // describe('DynamoDBTableUtil')
