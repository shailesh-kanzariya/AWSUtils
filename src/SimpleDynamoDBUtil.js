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
    this.docClient = new AWS.DynamoDB.DocumentClient(options)
  } // constructor

  /**
   * creates new item into the table
   * @param {string} tableName table in which new item to create
   * @param {JSON} itemJson new item to create
   * @param {string} [pkAttributeName] pkAttributeName given valid partition-key (pk) value, it prevents overwrite of existing item having same partition-key (pk) value
   */
  async createNewItemInTable (tableName, itemJson, pkAttributeName = null) {
    const funcName = 'createNewItemInTable: '
    try {
      // validate input params
      await ValidationUtil.isValidString([tableName])
      await ValidationUtil.isValidObject([itemJson, this.docClient])
      // prepare params
      const params = {
        TableName: tableName,
        Item: itemJson,
        ReturnValues: 'ALL_OLD'
      }
      if (pkAttributeName && typeof pkAttributeName === 'string') {
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
