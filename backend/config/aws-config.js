require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const AWS = require('aws-sdk');

console.log("ENV BUCKET:", process.env.S3_BUCKET); // test

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const S3_BUCKET = process.env.S3_BUCKET;

module.exports = { s3, S3_BUCKET };