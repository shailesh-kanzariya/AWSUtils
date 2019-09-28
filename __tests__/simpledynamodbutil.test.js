const { SimpleDynamoDBUtil } = require('../src/SimpleDynamoDBUtil')
// ddb config options to run local
const config = {
  convertEmptyValues: true,
  endpoint: 'localhost:8000',
  sslEnabled: false,
  region: 'local-env'
}
let simpleDDBUtil = null
simpleDDBUtil = new SimpleDynamoDBUtil(config)

xdescribe('SimpleDynamoDBUtil', () => {
  beforeEach(() => {
    jest.setTimeout(5000)
  }) // beforeEach
  // createNewItemInTable
  describe('createNewItemInTable', () => {
    test('should create item successfully, when valid arguments passed', async () => {
      expect.assertions(1)
      const userItem = { id: '1', hello: 'world' }
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      const { Item } = await simpleDDBUtil.docClient.get({ TableName: 'users', Key: { id: '1' } }).promise()
      await expect(Item).toEqual(userItem)
    }) // test
    test('should throw an error, when non-existent table passed', async () => {
      expect.assertions(1)
      const userItem = { id: '1', hello: 'world' }
      await expect(simpleDDBUtil.createNewItemInTable('users-invalid', userItem, 'id')).rejects.toThrowError('Cannot do operations on a non-existent table')
    }) // test
    test('should throw an error, when invalid userItem passed', async () => {
      expect.assertions(1)
      const userItem = { id: '', hello: 'world' }
      await expect(simpleDDBUtil.createNewItemInTable('users', userItem, 'id')).rejects.toThrowError('Invalid attribute value type')
    }) // test
    test('should create new item and return old item-json data, when invalid pkAttributeName passed and similar item already exist', async () => {
      expect.assertions(1)
      const userItem = { id: '1', hello: 'world' }
      const { Attributes } = await simpleDDBUtil.createNewItemInTable('users', userItem, 'idinvalidpk')
      await expect(Attributes).toEqual(userItem)
    }) // test
    test('should overwrite existing item, when similar item already exist', async () => {
      expect.assertions(1)
      const userItem = { id: '100', hello: 'world' }
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      // new item to overwrite
      const updatedUserItem = { id: '100', hello: 'AWS' }
      await simpleDDBUtil.createNewItemInTable('users', updatedUserItem) // overwrite an existing item
      // get overwritten item
      const { Item } = await simpleDDBUtil.docClient.get({ TableName: 'users', Key: { id: '100' } }).promise()
      await expect(Item).toEqual(updatedUserItem)
    }) // test
    test('should prevent overwrite to existing item and throw an error, when valid pkAttributeName passed and similar item already exist', async () => {
      expect.assertions(1)
      const userItem = { id: '200', hello: 'world' }
      await simpleDDBUtil.createNewItemInTable('users', userItem)
      // new item to overwrite
      const updatedUserItem = { id: '200', hello: 'AWS' }
      await expect(simpleDDBUtil.createNewItemInTable('users', updatedUserItem, 'id')).rejects.toThrowError('The conditional request failed')
    }) // test
  }) // describe('createNewItemInTable')
}) // describe('SimpleDynamoDBUtil')
