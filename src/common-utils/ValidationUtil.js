const winston = require('winston')
winston.add(new winston.transports.Console()) // add console as transport target
const debug = require('debug')('ValidationUtil')
require('dotenv').config()

/*
Performs various 'data validations' i.e. is valid string type?, is valid JSON?, is valid email? etc.
*/
class ValidationUtil extends Object {
  // validate each string item in list
  static async isValidStringData (strListToValidate, shouldCheckEmptyValue = true) {
    const funcName = 'isValidStringData: '
    const invalidParamsList = []
    try {
      debug(`${funcName}strListToValidate = ${JSON.stringify(strListToValidate)}, shouldCheckEmptyValue = ${shouldCheckEmptyValue}`)
      if (!(strListToValidate && Array.isArray(strListToValidate))) {
        winston.error(`invalid input parameter: strListToValidate = ${JSON.stringify(strListToValidate)}`)
        throw (new Error(`invalid input parameter: strListToValidate = ${JSON.stringify(strListToValidate)}`))
      } // if
      // validate each string-element from the list
      for (const stringElement of strListToValidate) {
        debug(`${funcName}stringElement = ${stringElement}`)
        if (!(stringElement !== null && stringElement !== undefined && typeof stringElement === 'string')) {
          debug(`${funcName}pushing invalid param stringElement = ${stringElement}`)
          invalidParamsList.push(stringElement)
        } else if (shouldCheckEmptyValue) {
          if (!String(stringElement).length > 0) {
            debug(`${funcName}pushing invalid param stringElement = ${stringElement}`)
            invalidParamsList.push(stringElement)
          } // if
        } // else if
      } // for of
      if (invalidParamsList.length > 0) {
        debug(`${funcName}invalidParamsList = ${JSON.stringify(invalidParamsList)}`)
        throw (new Error(`invalid data, invalidParamsList = ${JSON.stringify(invalidParamsList)}`))
      } // if
      return strListToValidate
    } catch (error) {
      winston.error(`error = ${error}`)
      throw (error)
    }
  } // function isValidStringData

  // validate each json item in list
  static async isValidJsonData (jsonListToValidate, shouldCheckEmptyValue = true) {
    const funcName = 'isValidJsonData: '
    const invalidParamsList = []
    try {
      debug(`${funcName}jsonListToValidate = ${JSON.stringify(jsonListToValidate)}, shouldCheckEmptyValue = ${shouldCheckEmptyValue}`)
      if (!(jsonListToValidate && Array.isArray(jsonListToValidate))) {
        winston.error(`${funcName}invalid input parameter: jsonListToValidate = ${JSON.stringify(jsonListToValidate)}`)
        throw (new Error(`${funcName}invalid input parameter: jsonListToValidate = ${JSON.stringify(jsonListToValidate)}`))
      }
      // check each json-item if its valid json
      for (const jsonElement of jsonListToValidate) {
        debug(`${funcName}jsonElement = ${JSON.stringify(jsonElement)}`)
        for (const key in jsonElement) {
          // eslint-disable-next-line no-prototype-builtins
          if (jsonElement.hasOwnProperty(key)) {
            const keyVal = jsonElement[key]
            debug(`${funcName}key = ${key}, keyVal = ${keyVal}`)
            // check for value
            if (shouldCheckEmptyValue) {
              if (!String(keyVal).length > 0) {
                debug(`${funcName}pushing invalid param keyVal = ${keyVal}`)
                invalidParamsList.push(jsonElement)
              }
            } // if
          } // if
        } // for in
      } // for of
      if (invalidParamsList.length > 0) {
        debug(`${funcName}invalidParamsList = ${JSON.stringify(invalidParamsList)}`)
        throw (new Error(`invalid data, invalidParamsList = ${JSON.stringify(invalidParamsList)}`))
      } // if
      return jsonListToValidate
    } catch (error) {
      winston.error(`error = ${error}`)
      throw (error)
    }
  } // function isValidJsonData
} // class

module.exports = {
  ValidationUtil
}
