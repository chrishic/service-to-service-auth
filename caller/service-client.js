'use strict';

var jwt = require('jwt-simple'),
    moment = require('moment');


/////////////////////////////////////////////
//  Constants
/////////////////////////////////////////////

//  Tokens get 10 minute TTLs
var JWT_TIME_TO_LIVE_IN_MINS = 10;


/////////////////////////////////////////////
//  Class definition
/////////////////////////////////////////////

var ServiceClient = (function() {

    function ServiceClient(endpoint, service_name, caller_name, secret) {

        if (!caller_name || typeof caller_name !== 'string') {
            caller_name = '';
        }

        if (!secret || typeof secret !== 'string') {
            secret = '';
        }

        this.endpoint = endpoint;
        this.service_name = service_name;
        this.caller_name = caller_name;
        this.secret = secret;

        if (!this.endpoint || typeof this.endpoint !== 'string') {
            throw new Error('`endpoint` must be a string');
        }

        if (!this.service_name || typeof this.service_name !== 'string') {
            throw new Error('`service_name` must be a string');
        }

        //  Service to service calls use a special role
        this.roles = ['service'];

    }

    ServiceClient.prototype.setSecret = function(secret) {

        if (!secret || typeof secret !== 'string') {
            throw new Error('`secret` must be a string');
        }

        this.secret = secret;

    };

    ServiceClient.prototype.genJWT = function() {

        var expires = moment().add(JWT_TIME_TO_LIVE_IN_MINS, 'minutes').valueOf();

        var secretDecoded = new Buffer(this.secret, 'base64');

        var payload = {
            "aud": this.service_name,
            "exp": expires,
            "sub": "service|" + this.caller_name,
            "roles": this.roles
        };

        var token = jwt.encode(payload, secretDecoded);

        return token;

    };

    ServiceClient.prototype.call = function(api, method, input, callback) {

        var uri = this.endpoint + api;

        var reqOpts = {
            "uri": uri,
            "method": method
        };

        if (input && typeof input === 'object') {
            reqOpts.body = JSON.stringify(input);
        }

        var headerOpts = {};

        if (this.secret) {
            var token = this.genJWT();
            headerOpts['Authorization'] = "Bearer " + token;
        }

        makeHttpRequest(reqOpts, headerOpts, callback);

    };

    return ServiceClient;

})();


/////////////////////////////////////////////
//  Exports
/////////////////////////////////////////////

exports = module.exports = ServiceClient;
