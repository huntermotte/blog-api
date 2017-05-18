exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://admin:admin@ds137261.mlab.com:37261/blog-api-database';

exports.TEST_DATABASE_URL = 'mongodb://localhost:27017/blog-api-database';

exports.PORT = process.env.PORT || 8080;
