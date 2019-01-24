/*
* Helpers for various tasks  
*
*
*/

// Dependencies 
var crypto = require ('crypto');
var config = require('../config');

// Container for the helpers object 
var helpers = {};

helpers.hash = function(str){
    // Use SHA256 for hashing the password 
    if(typeof(str) == 'string' && str.length>0){
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        // return hash ;
    } else {
        return false ;
    }
};

// Parse a JSON object to an object in all cases, without throwing 
helpers.parseJsonToObject = function(str){
    try{
        var obj = JSON.parse(str);
        return obj ;
    }
    catch(e){
        return {};
    }
};








// Export the module 
module.exports = helpers;