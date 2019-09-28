const { ValidationUtil } = require('./../src/common-utils/ValidationUtil')

describe('ValidationUtil', () => {
  // uni test 'isValidString' function
  beforeEach(() => {
    jest.setTimeout(5000)
  }) // beforeEach
  describe('isValidString', () => {
    test('should return an array, when valid array is passed', async () => {
      expect.assertions(1)
      const strParamList = ['Apple', 'Microsoft', 'Google', 'Amazon']
      const resultStrList = await ValidationUtil.isValidString(strParamList)
      await expect(resultStrList).toEqual(strParamList)
    }) // test
    test('should return an array, when an array containing empty-value-elements passed and \'shouldCheckEmptyValue\' is false', async () => {
      expect.assertions(1)
      const strParamList = ['Apple', 'Microsoft', '', '']
      const resultStrList = await ValidationUtil.isValidString(strParamList, false)
      await expect(resultStrList).toEqual(strParamList)
    }) // test
    test('should throw an error, when an array containing empty-string-value-elements passed', async () => {
      expect.assertions(1)
      const strParamList = ['Apple', 'Microsoft', '', '']
      await expect(ValidationUtil.isValidString(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when an array containing elements of different types are passed', async () => {
      expect.assertions(1)
      const strParamList = ['Apple', 20, 12.20, false, true]
      await expect(ValidationUtil.isValidString(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when an array containing only \'true\' bool-element passed', async () => {
      expect.assertions(1)
      const strParamList = [true] // test value comparision logic
      await expect(ValidationUtil.isValidString(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when an array containing only \'false\' bool-element passed', async () => {
      expect.assertions(1)
      const strParamList = [false] // test value comparision logic
      await expect(ValidationUtil.isValidString(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when non-array type is passed', async () => {
      expect.assertions(1)
      const strParamList = 'non-array type'
      await expect(ValidationUtil.isValidString(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when \'null\' is passed', async () => {
      expect.assertions(1)
      const strParamList = null
      await expect(ValidationUtil.isValidString(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when no argument is passed', async () => {
      expect.assertions(1)
      await expect(ValidationUtil.isValidString()).rejects.toThrowError(Error)
    }) // test
  }) // describe('isValidString')
  describe('isValidObject', () => {
    test('should return an array, when valid object-array passed', async () => {
      expect.assertions(1)
      const strParamList = [{ name: 'Apple' }, ['Microsoft'], [123.67], { value: 'val' }]
      const resultStrList = await ValidationUtil.isValidObject(strParamList)
      await expect(resultStrList).toEqual(strParamList)
    }) // test
    test('should return an array, when array conatining valid empty json-object passed', async () => {
      expect.assertions(1)
      const strParamList = [{}]
      const resultStrList = await ValidationUtil.isValidObject(strParamList)
      await expect(resultStrList).toEqual(strParamList)
    }) // test
    test('should throw an error, when an array containing \'string\' item passed as an argument', async () => {
      expect.assertions(1)
      const strParamList = ['Apple']
      await expect(ValidationUtil.isValidObject(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when an array containing \'number\' item passed', async () => {
      expect.assertions(1)
      const strParamList = [12.345]
      await expect(ValidationUtil.isValidObject(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when an array containing \'bool\' item passed', async () => {
      expect.assertions(1)
      const strParamList = [true]
      await expect(ValidationUtil.isValidObject(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when an array containing \'Symbol\' item passed', async () => {
      expect.assertions(1)
      const sym = Symbol('foo')
      const strParamList = [sym]
      await expect(ValidationUtil.isValidObject(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when an array contains only \'null\' item passed', async () => {
      expect.assertions(1)
      const strParamList = [null]
      await expect(ValidationUtil.isValidObject(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when an array contains only \'undefined\' item passed', async () => {
      expect.assertions(1)
      const strParamList = [undefined]
      await expect(ValidationUtil.isValidObject(strParamList)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when no argument is passed', async () => {
      expect.assertions(1)
      await expect(ValidationUtil.isValidObject()).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when \'null\' argument is passed', async () => {
      expect.assertions(1)
      await expect(ValidationUtil.isValidObject(null)).rejects.toThrowError(Error)
    }) // test
    test('should throw an error, when non-array type argument is passed', async () => {
      expect.assertions(1)
      await expect(ValidationUtil.isValidObject('non-array type arg')).rejects.toThrowError(Error)
    }) // test
  }) // describe('isValidObject')
}) // describe('ValidationUtil')
