const { ValidationUtil } = require('./src/common-utils/ValidationUtil');

(async () => {
  await ValidationUtil.isValidStringData(['1', '2', '3'])
})()
