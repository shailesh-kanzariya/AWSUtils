const winston = require('winston')
winston.add(new winston.transports.Console()) // add console as transport target
const debug = require('debug')('SimpleDynamoDBUtil')
const AWS = require('aws-sdk')
const { ValidationUtil } = require('./common-utils/ValidationUtil')

/**
 * creates a new object of SimpleDynamoDBUtil, exposes 'AWS DynamoDB' helper functions
 * @class SimpleDynamoDBUtil
 */
class SimpleDynamoDBUtil extends Object {
  /**
   * @param {JSON} options
   */
  constructor (options) {
    super()
    this.dynamodb = new AWS.DynamoDB(options)
    this.docClient = new AWS.DynamoDB.DocumentClient(options)
  } // constructor

  /**
   * get table information including pk schema, indexes, created-on, provisioned throughput etc.
   * @param {string} tableName table about which to get information
   */
  async getTableInfo (tableName) {
    const funcName = 'getTableInfo: '
    try {
      // validate input params
      await ValidationUtil.isValidString([tableName])
      await ValidationUtil.isValidObject([this.dynamodb])
      // prepare params
      const params = {
        TableName: tableName
      }
      debug(`${funcName}params = ${JSON.stringify(params)}`)
      const data = await this.dynamodb.describeTable(params).promise()
      debug(`${funcName}data = ${JSON.stringify(data)}`)
      return data
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // getTableInfo

  /**
   * get table's key schema e.g. partition-key, sorty-key attributes and types
   * @param {string} tableName table for which to get key schema information
   */
  async getKeySchemaForTable (tableName) {
    const funcName = 'getKeySchemaForTable: '
    try {
      // validate input params
      await ValidationUtil.isValidString([tableName])
      await ValidationUtil.isValidObject([this.dynamodb])
      debug(`${funcName}tableName = ${tableName}}`)
      const data = await this.getTableInfo(tableName)
      debug(`${funcName}data = ${JSON.stringify(data)}`)
      // extract key-schema info
      if (data.Table.KeySchema.length > 0) {
        const keySchema = data.Table.KeySchema[0]
        debug(`${funcName}keySchema = ${JSON.stringify(keySchema)}`)
        if (keySchema) {
          return keySchema
        }
      }
      return null // no key schema found
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // getKeySchemaForTable

  /**
   * creates new item into the table
   * @param {string} tableName table in which new item to create
   * @param {JSON} itemJson new item to create
   * @param {Boolean} [shouldOverwriteExistingItem=true] overwrites existing item if item having same partition-key (pk) value already exist
   */
  async createNewItemInTable (tableName, itemJson, shouldOverwriteExistingItem = true) {
    const funcName = 'createNewItemInTable: '
    try {
      // validate input params
      await ValidationUtil.isValidString([tableName])
      await ValidationUtil.isValidObject([itemJson, this.docClient])
      await ValidationUtil.isValidBoolean(shouldOverwriteExistingItem)
      // prepare params
      const params = {
        TableName: tableName,
        Item: itemJson,
        ReturnValues: 'ALL_OLD'
      }
      if (shouldOverwriteExistingItem === false) { // don't overwrite an existing item
        // get table's keyschema
        const tableKeySchema = await this.getKeySchemaForTable(tableName)
        debug(`${funcName}tableKeySchema = ${JSON.stringify(tableKeySchema)}`)
        const pkAttributeName = tableKeySchema.AttributeName
        debug(`${funcName}pkAttributeName = ${pkAttributeName}`)
        params.ConditionExpression = `attribute_not_exists(${pkAttributeName})`
      }
      debug(`${funcName}params = ${JSON.stringify(params)}`)
      const data = await this.docClient.put(params).promise()
      debug(`${funcName}data = ${JSON.stringify(data)}`)
      return data
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // createNewItem

  /**
   * get specified item from table
   * @param {string} tableName table from which to get the item
   * @param {JSON} pkAttributeName partition key attribute-name
   * @param {any} itemPkValue partition key attribute-value of the item to get
   */
  async getItemFromTable (tableName, pkAttributeName, itemPkValue) {
    const funcName = 'getItemFromTable: '
    try {
      // validate input params
      await ValidationUtil.isValidString([tableName, pkAttributeName])
      await ValidationUtil.isValidObject([this.docClient])
      if (itemPkValue === null || itemPkValue === undefined) {
        winston.error(`${funcName}invalid param: itemPkValue = ${itemPkValue}`)
        throw (new Error(`${funcName}invalid param: itemPkValue = ${itemPkValue}`))
      }
      // prepare params
      const params = {
        TableName: tableName,
        Key: {}
      }
      params.Key[pkAttributeName] = itemPkValue // set pkAttributeName and its value
      debug(`${funcName}params = ${JSON.stringify(params)}`)
      const data = await this.docClient.get(params).promise()
      debug(`${funcName}data = ${JSON.stringify(data)}`)
      if (!data.Item) { // no 'Item' element returned if matching item not found
        return null
      }
      return data.Item
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // createNewItem
  /**
   * simple query to the table
   * @param {string} tableName
   * @param {string} keyConditionExpression
   * @param {JSON} expressionAttributeNames
   * @param {JSON} expressionAttributeValues
   * @param {string} filterExpression
   * @param {string} projectionExpression
   */
  /*
  async queryTableSimple (tableName, keyConditionExpression, expressionAttributeNames, expressionAttributeValues, filterExpression = null, projectionExpression = null) {
    const funcName = 'queryTableSimple: '
    try {
      // validate input params
      await ValidationUtil.isValidString([tableName, keyConditionExpression])
      await ValidationUtil.isValidObject([this.docClient, expressionAttributeNames, expressionAttributeValues])
      // prepare params
      const params = {
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        FilterExpression: filterExpression,
        ProjectionExpression: projectionExpression
      }
      debug(`${funcName}params = ${JSON.stringify(params)}`)
      const data = await this.docClient.query(params).promise()
      debug(`${funcName}data = ${JSON.stringify(data)}`)
      return data
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // queryTableSimple
  */
} // class

module.exports = {
  SimpleDynamoDBUtil
}
