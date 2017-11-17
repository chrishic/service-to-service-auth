'use strict';

var util = require('util'),
    CONF = require('config'),
    ServiceClient = require('./service-client'),
    CredentialsProvider = require('./credentials-provider');


/////////////////////////////////////////////
//  Public functions
/////////////////////////////////////////////

(function () {

    var service_name = "forms-service";
    var caller_name = "customer-dashboard-service";

    var FormsService = new ServiceClient(CONF.forms.hostname, service_name, caller_name);

    module.exports = FormsService;

    //  Get "Forms Service" shared secret
    var key = util.format('%s/auth.key', CONF.forms.s3_credentials_path);
    CredentialsProvider.get(key, CONF.aws.s3_bucket, CONF.aws.region, function(err, data) {
        if (err) {
            throw err;
        }

        FormsService.setSecret(data.secret);
    });

})();
