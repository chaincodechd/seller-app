const { Storage } = require('@google-cloud/storage');
const path = require('path');
const serviceKeys = path.join(__dirname, './config.json');

const storage = new Storage({
    keyFilename: serviceKeys,
    projectId: process.env.PROJECT_ID
});

const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);


module.exports = bucket;
