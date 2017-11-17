'use strict';

var assert = require('assert'),
    util = require('util'),
    AWS = require('aws-sdk');


/////////////////////////////////////////////
//  Public functions
/////////////////////////////////////////////

var get = function(key, bucket, region, callback) {

    assert(key && typeof key === 'string');
    assert(bucket && typeof bucket === 'string');
    assert(region && typeof region === 'string');
    assert(callback && typeof callback === 'function');

    AWS.config.region = region;

    var s3 = new AWS.S3();
    var params = {
        "Bucket": bucket,
        "Key": key
    };

    s3.getObject(params, function(err, data) {
        if (err) {
            return callback(err);
        }

        if (!data || typeof data !== 'object' || !data.Body || typeof data.Body !== 'object') {
            return callback(new Error('Unexpected response from S3.'));
        }

        var kms = new AWS.KMS();
        var params = {
            "CiphertextBlob": data.Body
        };

        kms.decrypt(params, function(err, data) {
            if (err) {
                return callback(err);
            }

            if (!data || typeof data !== 'object' || !data.Plaintext) {
                return callback(new Error('Unexpected response from KMS::decrypt.'));
            }

            var creds;
            try {
                creds = JSON.parse(data.Plaintext);
            }
            catch (e) {
                var msg = util.format('Unable to parse decrypted text as JSON. Reason: %s. Source text: %s.', util.inspect(e), data.Plaintext);
                return callback(new Error(msg));
            }

            callback(null, creds);
        });
    });

};


/////////////////////////////////////////////
//  Exports
/////////////////////////////////////////////

exports.get = get;
