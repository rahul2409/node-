/*
* Helpers for various tasks  
*
*
*/

// Dependencies 
var crypto = require ('crypto');
var config = require('./config');

// Container for the helpers object 
var helpers = {};

helpers.hash = function(str){
    // Use SHA256 for hashing the password 
    // console.log(typeof(str));
    if(typeof(str) == 'string' && str.length>0){
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        //console.log(hash);
        return hash ;
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

// Create a string of random alphanymeric charecters, of a given length
helpers.createRandomString =function(strLength){
    strLength = typeof(strLength) == 'number' && strLength >0 ?strLength:false;
    if(strLength){
        // Define all possible charecters that would go in a string 
        var possibleCharecters = 'abcdefghijklmnopqrstuvwxyz1234567890';

        // Start the final string
        var str = '';
        for(i=0;i<strLength;i++){
            // Get a random charecter from the set of possible charecters 
            var randomCharecter = possibleCharecters.charAt(Math.floor(Math.random()*possibleCharecters.length));
            // Append the charecter to the main string
            str = str+ randomCharecter;
        }

        return str;
    } else {
        return false;
    }
};






// Export the module 
module.exports = helpers;