const { ValidationUtil } = require('./../src/common-utils/ValidationUtil')

describe('ValidationUtil', () => {
  describe('isValidStringData', () => {
    beforeEach(() => {
      jest.setTimeout(5000)
    }) // beforeEach
    test('isValidStringData returns an array, passed as an argument', async () => {
      expect.assertions(1)
      const strParamList = ['Apple', 'Microsoft', 'Google', 'Amazon']
      const resultStrList = await ValidationUtil.isValidStringData(strParamList)
      await expect(resultStrList).toEqual(strParamList)
    }) // test
    test('isValidStringData throws an error, when an array containing empty-value-elements passed as an argument', async () => {
      expect.assertions(1)
      const strParamList = ['Apple', 'Microsoft', '', '']
      await expect(ValidationUtil.isValidStringData(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('isValidStringData throws an error, when an array containing elements of different types are passed as an argument', async () => {
      expect.assertions(1)
      const strParamList = ['Apple', 20, 12.20, false, true]
      await expect(ValidationUtil.isValidStringData(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('isValidStringData throws an error, when non-array type is passed as an argument', async () => {
      expect.assertions(1)
      const strParamList = 'non-array type'
      await expect(ValidationUtil.isValidStringData(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('isValidStringData throws an error, when \'null\' is passed as an argument', async () => {
      expect.assertions(1)
      const strParamList = null
      await expect(ValidationUtil.isValidStringData(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('isValidStringData throws an error, when no argument is passed', async () => {
      expect.assertions(1)
      await expect(ValidationUtil.isValidStringData()).rejects.toThrowError(Error)
    }) // test
  }) // describe('isValidStringData')
}) // describe('ValidationUtil')
