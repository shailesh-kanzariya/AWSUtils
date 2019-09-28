const { ValidationUtil } = require('./src/common-utils/ValidationUtil');

(async () => {
  await ValidationUtil.isValidString(['1', '2', '3'])
})()
