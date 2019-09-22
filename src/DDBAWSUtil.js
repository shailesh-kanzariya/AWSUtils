/* eslint-disable import/no-absolute-path */
const AWS = require('aws-sdk')
const validationUtil = require('/opt/nodejs/validation-util')
const { AWSUtilsConfigs } = require('./aws-utils-configs')
const moduleName = 'DDBAWSUtil: '
let docClient = null

class DDBAWSUtil extends AWS.DynamoDB {
  constructor (configs) {
    super()
    this.docClient = new AWS.DynamoDB.DocumentClient(configs)
  }
}

async function loadConfigs () {
  const funcName = 'loadConfigs: '
  try {
    console.log(`${String(moduleName).concat(funcName)}, AWSUtilsConfigs = ${JSON.stringify(AWSUtilsConfigs)}`)
    // set AWS region to send service requests to
    AWS.config.update({ region: AWSUtilsConfigs.aws_ddb_region })
    // Create DynamoDB document client object
    docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: AWSUtilsConfigs.aws_ddb_api_version })
  } catch (error) {
    console.log(`${String(moduleName).concat(funcName)}error = ${error}`)
    throw (error)
  }
};
// load configs first
(async () => {
  console.log(`${String(module)}loading configs...`)
  await loadConfigs()
})()

// put item into DDB table as per params
async function putItemInTable (params) {
  const funcName = 'putItemInTable: '
  try {
    console.log(`${String(moduleName).concat(funcName)}params = ${JSON.stringify(params)}`)
    // validate 'params' input parameter
    await validationUtil.validateJSONTypeParamList([params])
    const data = await docClient.put(params).promise()
    console.log(`${String(moduleName).concat(funcName)}data = ${JSON.stringify(data)}`)
    if (!data) {
      console.log(`${String(moduleName).concat(funcName)}invalid data`)
      throw (new Error('Failed to put item'))
    }
    return data
  } catch (error) {
    console.log(`${String(moduleName).concat(funcName)}error = ${error}`)
    throw (error)
  }
}

// get item from DDB table as per params
async function getItemFromTable (params) {
  const funcName = 'getItemFromTable: '
  try {
    console.log(`${String(moduleName).concat(funcName)}params = ${JSON.stringify(params)}`)
    const data = await docClient.get(params).promise()
    console.log(`${String(moduleName).concat(funcName)}data = ${data}`)
    console.log(`${String(moduleName).concat(funcName)}data = ${JSON.stringify(data.Item)}`)
    if (data === null || data === undefined || data.Item === null || data.Item === undefined) {
      console.log(`${String(moduleName).concat(funcName)} data invalid`)
      throw (new Error('Item not found for given values'))
    }
    return data.Item
  } catch (error) {
    console.log(`${String(moduleName).concat(funcName)}error = ${error}`)
    throw (error)
  }
}

module.exports = {
  putItemInTable,
  getItemFromTable,
  DDBAWSUtil
}
