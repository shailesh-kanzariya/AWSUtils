const winston = require('winston')
winston.add(new winston.transports.Console()) // add console as trsport target
const debug = require('debug')('DynamoDBTableUtil')
const { SimpleDynamoDBUtil } = require('./SimpleDynamoDBUtil')
const { ValidationUtil } = require('./common-utils/ValidationUtil')

class DynamoDBTableUtil extends SimpleDynamoDBUtil {
  constructor (options, tableName, pkAttributeName, skAttributeName = null) {
    const funcName = 'constructor: '
    debug(`${funcName} options = ${JSON.stringify(options)}, pkAttributeName = ${pkAttributeName}, skAttributeName = ${skAttributeName}`)
    if (!(options && tableName && pkAttributeName && typeof tableName === 'string' &&
      typeof pkAttributeName === 'string' && String(tableName).length > 0 && String(pkAttributeName).length > 0)) {
      winston.error(`${funcName}invalid constructor argument`)
      throw (new Error('invalid constructor argument'))
    }
    super(options)
    this.tableName = tableName
    this.pkAttributeName = pkAttributeName
    if (skAttributeName) {
      if (!(typeof skAttributeName === 'string' && String(skAttributeName).length > 0)) {
        winston.error(`${funcName}invalid constructor argument`)
        throw (new Error('invalid constructor argument'))
      }
      this.skAttributeName = skAttributeName
    }
  } // constructor

  async createNewItem (itemJson) {
    const funcName = 'createNewItem: '
    try {
      debug(`${funcName}itemJson = ${JSON.stringify(itemJson)}`)
      // throw error if this.tableName and this.pkAttributeName values are not set
      await ValidationUtil.isValidString([this.tableName, this.pkAttributeName])
      const data = await super.createNewItemInTable(this.tableName, itemJson, false) // protect overwrite
      return data
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // createNewItem

  async createNewOrReplaceItem (itemJson) {
    const funcName = 'createNewOrReplaceItem: '
    try {
      debug(`${funcName}itemJson = ${JSON.stringify(itemJson)}`)
      // throw error if this.tableName and this.pkAttributeName values are not set
      await ValidationUtil.isValidString([this.tableName, this.pkAttributeName])
      const data = await super.createNewItemInTable(this.tableName, itemJson) // overwrite existing similar item if exist
      return data
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // createNewItem
} // class
module.exports = {
  DynamoDBTableUtil
}
