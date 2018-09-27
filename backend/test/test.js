const test = require('tape-async');
const axios = require("axios");

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// we need this to inspect payloads stored in S3, not yet implemented
// const sleep = require('await-sleep')

const apiEndpoint = process.argv[2];
if(!apiEndpoint) {
  console.log('no api endpoint specified as argument');
  process.exit(1)
}
const bucket = process.argv[3] || 'mehi-collector-dev-events';
if(!bucket) {
  console.log('no bucket name specified as argument');
  process.exit(1)
}

console.log(bucket);

// genrate random test id
const testId = 'test-'+Math.random().toString(36).slice(2);

test('async', async function(t) {

  let body = {testId: testId};
  await axios({
    url : apiEndpoint + '?data=' + encodeURIComponent(JSON.stringify(body)),
    method : 'GET'
  }).catch(t.fail);
  await axios({
    url : apiEndpoint,
    method : 'POST',
    headers: { 'content-type': 'text/plain' },
    data : JSON.stringify(body)
  }).catch(t.fail);
  r = await axios({
    url : apiEndpoint,
    method : 'POST',
    headers: { 'content-type': 'application/json' },
    data : body
  }).catch(t.fail);

  const s3params = {
    Bucket: bucket,
    MaxKeys: 20
  };
  s3.listObjectsV2(s3params, function(err, data) {
    if (err) {
      console.log(err);
      t.fail();
    }
    else {
      console.log(data)
      t.pass('No automated testing for contents yet, you need to manually inspect them :(');
    }


  });

});
