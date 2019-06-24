/*
 * Request handlers 
 *
 * 
 */

// Dependencies 
var _data = require('./data');
var helpers = require('./helpers');
var config= require('./config');

// Define handler object 
var handlers ={};

// Define users 
handlers.users =function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data,callback);
    } else {
        callback(405);
    }
};

// container for users methods 
handlers._users ={};

// users= post 
// Required data : firstname,lastname, phone , password,tosAgreement 
// Optional data : none 
handlers._users.post = function(data,callback){
    // Check the required data
    var payload = (data.payload);
    // used for debugging console.log (payload);
    var firstName = typeof(payload.firstName) == 'string' && payload.firstName.trim().length > 0? payload.firstName.trim() : false ;
    var lastName = typeof(payload.lastName) == 'string' && payload.lastName.trim().length > 0? payload.lastName.trim() : false ;
    // Phone number is taken as string 
    var phone = typeof(payload.phone) == 'string' && payload.phone.trim().length == 10? payload.phone.trim() : false ;
    var password = typeof(payload.password) == 'string' && payload.password.trim().length >0?payload.password.trim() : false;
    var tosAgreement = typeof(payload.tosAgreement) == 'boolean' && payload.tosAgreement == true ?true : false;
    // Because checking the liscense agreement is important 
    // console.log(firstName,' ',lastName,' ',phone ,' ',password,' ',tosAgreement);
    
    if(firstName && lastName && phone && password && tosAgreement){
        // Make sure that the user does not exist 
        _data.read('users',phone,function(err,data){
            if(err){
                // Hash the password 
                var hashedPassword = helpers.hash(password);
                
                // If the password wasn't hashed then the user should not be created for security reasons 
                if(hashedPassword){
                
                    // Create the user object 
                    var userObject ={
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'phone' : phone ,
                        'hashedPassword' : hashedPassword,
                        'tosAgreement' : tosAgreement
                    };

                    // Storing the user on the file 
                    _data.create('users',phone,userObject,function(err){
                        if (!err){
                            callback(200)
                        } else {
                            console.log(err);
                            callback(500,{'Error' : 'Could not create a new user'});
                        }
                    });
                                        
                } else {
                    callback(500,{'Error' : 'Could not hash the user\'s password'});
                }

                
            } else {
                // User already exist 
                callback(400,{'error' : 'A user with the same phone number exists'});
            }
        });
    } else {
        callback(400,{'error' : 'Missing required data'});
    }
};

// users = get
// Required Data : phone 
// Optional data : none 
// @TODO only let an authenticated user access its object don't let un authorized user to access the anyone else's object  
handlers._users.get = function(data,callback){
    // Check whether the phone number is valid 
    // The data object passed contains the queryStringObject alog side payload use this to get the phone number 
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false ;
    if (phone){

        // Get the token from the header 
        var token = typeof(data.headers.token) == 'string' ? data.headers.token :false;
        console.log(data.headers);
        // verify the given token 
        handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
            if(tokenIsValid){
                _data.read('users',phone,function(err,data){
                    if(!err && data){
                        // Remove the hash password before returning the value tothe user 
                        delete data.hashedPassword;
                        callback(200,data);
                    } else{
                        callback(404);
                    }
                });
            } else {
                callback(403,{'Error':'required token is not passed in header or the token is invalid'});
            }
        });
        
    } else {
        callback(400,{'Error': 'missing required phone number'});
    }
};

// users= put 
// Required data phone number 
// Optional data - firstName , lastName , password (atleast one should be specified)
// @TODO only let an authenticated user update his/her object 
// Don't let them update anyone else's 
handlers._users.put = function(data,callback){
    // Check for the required field 
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false ;

    // Optional fields 
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0? data.payload.firstName.trim() : false ;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0? data.payload.lastName.trim() : false ;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length >0?data.payload.password.trim() : false;

    // Error if phone is invalid 
    if(phone){
        // Get the token from the header 
        var token = typeof(data.headers.token) == 'string' ?data.headers.token :false;
        // verify the given token 
        handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
            if(tokenIsValid){
                // Error if no optional fields are mentioned 
                if(firstName || lastName || password){
                    // Lookup the user 
                    _data.read('users',phone,function(err,userData){
                        if(!err && userData){
                            // Update the necessary fields 
                            if(firstName){
                                userData.firstName = firstName;
                            }
                            if(lastName){
                                userData.lastName = lastName;
                            }
                            if(password){
                                userData.hashedPassword = helpers.hash(password);
                            }
                            // Store the object 
                            _data.update('users',phone,userData,function(err){
                                if(!err){
                                    callback(200);
                                } else {
                                    console.log(err);
                                    callback(500,{'Error' : 'Could not update the user'});
                                }
                            });
                        } else {
                            callback(400,{'Error':'Specified user does not exist'});
                        }
                    });
                } else{
                    callback(400,{'Error':'Missing required fields to update'});
                }        
            } else {
                callback(403,{'Error':'required token is not passed in header or the token is invalid'});
            }
        });
        
    } else {
        callback(400,{'Error':'Missing required fields'});
    }

};

// users= delete 
// Required = phone 
// @TODO Only an authenticated user can delete their object . Don't let them delete anyone else's object
// @TODO Cleanup (delete) any other data files associated with this user 
handlers._users.delete = function(data,callback){
    // Check whether the phone number is valid 
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false ;
    if (phone){
        // Get the token from the header 
        var token = typeof(data.headers.token) == 'string' ?data.headers.token :false;
        // verify the given token 
        handlers._tokens.verifyToken(token,phone,function(tokenIsValid){
            if(tokenIsValid){        
                _data.read('users',phone,function(err,data){
                    if(!err && data){
                        _data.delete('users',phone,function(err){
                            if(!err){
                                callback(200);
                            } else {
                                callback(500,{'Error':'Could not delete the specified user'});
                            }
                        });
                    } else{
                        callback(400, {'Error' : 'Could not find the specified user'});
                    }
                });                
            } else {
                callback(403,{'Error':'required token is not passed in header or the token is invalid'});
            }
        });

    } else {
        callback(400,{'Error': 'missing required phone number'});
    }
};

// define the handler.sample method 
handlers.ping =function(data, callback){
    // Callback an http status code of 200  
    callback(200);
};
// define the non found handler 
handlers.notfound= function(data,callback){
    // Call back the not found status code 
    callback(404);
};

// Define tokens 
handlers.tokens =function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data,callback);
    } else {
        callback(405);
    }
};

// Build a container for all the tokens 
handlers._tokens ={};

// Tokens - post 
// Required data: phone,password
// Optional data: none 
handlers._tokens.post = function(data,callback){
    var payload = (data.payload);
    var phone = typeof(payload.phone) == 'string' && payload.phone.trim().length == 10? payload.phone.trim() : false ;
    var password = typeof(payload.password) == 'string' && payload.password.trim().length >0?payload.password.trim() : false;
    if(phone && password){
        // Lookup the user that matches that phone number
        _data.read('users',phone,function(err,userData){
            if(!err && userData){
                // Hash the sent password and compare it with the password stored in the user object
                var hashedPassword = helpers.hash(password);
                if(hashedPassword == userData.hashedPassword){
                    // If valid, create a new token with a random name. Set expiration date one hour in the future 
                    var tokenId = helpers.createRandomString(20);
                    var expires = Date.now() + 1000*60*60;
                    var tokenObject = {
                        'phone':phone,
                        'id':tokenId,
                        'expires':expires
                    };

                    // Store the token 
                    _data.create('tokens',tokenId,tokenObject,function(err){
                        if(!err){
                            callback(200,tokenObject);
                        } else {
                            callback(500,{'Error' : 'Could not create the new token'});
                        }
                    });
                } else {
                    callback(400,{'Error': 'Password did not match the specified user\'s stored password'});
                }
            } else{
                callback(400,{'Error': 'Could not find the specified user'});
            }
        });
    } else{
        callback(400,{'Error':'Missing required fields'});
    }
};

// Tokens - get 
// Required -id 
// Optional data - none 
handlers._tokens.get= function(data,callback){
    // Check if id is valid 
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false ;
    if (id){
        // Read the token 
        _data.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
                callback(200,tokenData);
            } else{
                callback(404);
            }
        });
    } else {
        callback(400,{'Error': 'missing required id number'});
    }
};

// Tokens - put 
// Required data -id , extend 
handlers._tokens.put = function(data,callback){
    var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false ;
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false ;
    if(id && extend){
        // Lookup the token 
        _data.read('tokens',id,function(err,tokenData){
            if(!err && tokenData){
                // Check to make sure if the toke has not expired already 
                if(tokenData.expires > Date.now()){
                    // Now update the token expiration time 
                    tokenData.expires = Date.now()+ 1000*60*60;
                    
                    // Now update the file 
                    _data.update('tokens',id,tokenData,function(err){
                        if(!err){
                            callback(200);
                        } else { 
                            callback(400,{'Error' : 'Could not update the token\'s expiration date successfully'});
                        }
                    }); 
                } else {
                    callback(400,{'Error' : 'missing required fields'});
                }
            } else {
                callback(400,{'Error':'The token specified does not exists'})
            }
        });
    } else{
        // Inavalid fields or missing fields 
        callback(400, {'Error' : 'Missing required field(s) or field(s) have invalid value'});
    }
};

// Tokens - delete 
handlers._tokens.delete = function(data,callback){
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false ;
    if (id){
        _data.read('tokens',id,function(err,data){
            if(!err && data){
                _data.delete('tokens',id,function(err){
                    if(!err){
                        callback(200);
                    } else {
                        callback(500,{'Error':'Could not delete the specified token'});
                    }
                });
            } else{
                callback(400, {'Error' : 'Could not find the specified token'});
            }
        });
    } else {
        callback(400,{'Error': id});
    }
};

// Verify if the token id is valid for a given user 
handlers._tokens.verifyToken=function(id,phone,callback){
    // Lookup the token 
    _data.read('tokens',id,function(err,tokenData){
        if (!err && tokenData){
            // check that the token is for the valid user and also check that it has not been expired 
            if (tokenData.phone == phone && tokenData.expires>Date.now()){
                callback(true);
            } else {
                callback(true); // Has to be false !!!!
            }
        } else {
            callback(false);
        }
    });

};

// Building the checks !!!
handlers.checks =function(data,callback){
    var acceptableMethods = ['post','get','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._checks[data.method](data,callback);
    } else {
        callback(405);
    }
};

// Container for all the checks methods 
handlers._checks = {}

// Building the check post function 
// required data :- protocol, url, method, successCodes, timeoutSeconds 
// Optional data : none 

handlers._checks.post = function(data,callback){
    // validate all the inputs 
    var payload = (data.payload);
    var protocol = typeof(payload.protocol) == 'string' && ['https','http'].indexOf(payload.protocol) > -1 ? payload.protocol : false ;
    var url = typeof(payload.url) == 'string' && payload.url.trim().length > 0? payload.url.trim() : false ;
    var method = typeof(payload.method) == 'string' && ['post','get','put','delete'].indexOf(payload.method) > -1 ? payload.method : false ;
    var successCodes = typeof(payload.successCodes) == 'object' && payload.successCodes instanceof Array && payload.successCodes.length > 0? payload.successCodes : false ;
    var timeoutSeconds = typeof(payload.timeoutSeconds) == 'number' && payload.timeoutSeconds % 1 === 0 && payload.timeoutSeconds >=1 && payload.timeoutSeconds <=5 ? payload.timeoutSeconds : false ;
    // If the information is valid then 
    if(protocol && url && method && successCodes && timeoutSeconds){
        // Get the token from the headers 
        var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        
        // Now lookup the uiser by reading the token 
        _data.read('tokens',token,function(err, tokenData){
            if(!err && tokenData){
                var userPhone = tokenData.phone;
                // Lookup the user data 
                _data.read('users',userPhone,function(err,userData){
                    if(!err && userData){
                        // check the user checks 
                        var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                        // Verify the user has less than the max number of checks 
                        if(userChecks.length< config.maxChecks){
                            // create the random id for the checks 
                            var checkId = helpers.createRandomString(20);

                            // Create the check object and include the users phone number
                            // Do it the nosql way 
                            var checkObject = {
                                'id' : checkId,
                                'userPhone': userPhone,
                                'protocol' : protocol,
                                'url' : url,
                                'method' : method,
                                'successCodes' :successCodes,
                                'timeoutSeconds' : timeoutSeconds
                            };

                            // store the obejct in the data folder `
                            _data.create('checks', checkId,checkObject, function(err){
                                if(!err){
                                    userData.checks = userChecks;
                                    userData.checks.push(checkId);

                                    // now update the user object
                                    _data.update('users', userPhone,userData,function(err){
                                        if(!err) {
                                            // Return the data about the new check 
                                            callback(200, checkObject);
                                            
                                        } else {
                                            callback(500, {'Error': 'Could not update the user with the new check'});
                                        }
                                    });
                                } else {
                                    callback(500,{'Error' : "Could notcreate check"});
                                }
                            });
                        } else {
                            callback(400, {'Error' :'The max number of checks per user ('+ config.maxChecks +') has been reached'});

                        }
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(403);
            }
        });
    } else {
        callback(400, {'Error' : timeoutSeconds });
    }

};

// export the module 
module.exports = handlers;