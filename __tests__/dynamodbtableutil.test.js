const { DynamoDBTableUtil } = require('../src/DynamoDBTableUtil')
// ddb config options to run local
const config = {
  convertEmptyValues: true,
  endpoint: 'localhost:8000',
  sslEnabled: false,
  region: 'local-env'
}

const ddbTableUtil = new DynamoDBTableUtil(config, 'users', 'id')
describe('DynamoDBTableUtil', () => {
  beforeEach(() => {
    jest.setTimeout(5000)
  }) // beforeEach
  // createNewItem
  describe('createNewItem', () => {
    test('should create item successfully, when valid arguments passed', async () => {
      expect.assertions(1)
      const userItem = { id: '1', fName: 'John', lName: 'Doe' }
      await ddbTableUtil.createNewItem(userItem)
      const { Item } = await ddbTableUtil.docClient.get({ TableName: 'users', Key: { id: '1' } }).promise()
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
      const pkValue = '100'
      const userItem = { id: pkValue, fName: 'John', lName: 'Doe' }
      await ddbTableUtil.createNewItem(userItem)
      // new item to overwrite
      const updatedItem = { id: pkValue, fName: 'Maria', lName: 'Bose' }
      await expect(ddbTableUtil.createNewItem(updatedItem)).rejects.toThrowError('The conditional request failed')
    }) // test
  }) // describe('createNewItem')
  // createNewOrReplaceItem
  describe('createNewOrReplaceItem', () => {
    test('should create item successfully, when valid arguments passed', async () => {
      expect.assertions(1)
      const userItem = { id: '1', fName: 'John', lName: 'Doe' }
      await ddbTableUtil.createNewOrReplaceItem(userItem)
      const { Item } = await ddbTableUtil.docClient.get({ TableName: 'users', Key: { id: '1' } }).promise()
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
      const userItem = { id: '100', fName: 'John', lName: 'Doe' }
      await ddbTableUtil.createNewOrReplaceItem(userItem)
      // overwrite with new item data
      const updatedItem = { id: '100', fName: 'Maria', lName: 'Bose' }
      const { Attributes } = await ddbTableUtil.createNewOrReplaceItem(updatedItem) // overwrite
      await expect(Attributes).toEqual(userItem)
      const { Item } = await ddbTableUtil.docClient.get({ TableName: 'users', Key: { id: '100' } }).promise()
      await expect(Item).toEqual(updatedItem)
    }) // test
  }) // describe('createNewOrReplaceItem')
}) // describe('SimpleDynamoDBUtil')
