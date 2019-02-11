/*
 * Request handlers 
 *
 * 
 */

// Dependencies 
var _data = require('./data');
var helpers = require('./helpers');

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
    // Testing : console.log(firstName,' ',lastName,' ',phone ,' ',password,' ',tosAgreement);

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
        callback(400,{'Error': 'missing required phone number'});
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
                    callback(400,{'Error' : 'The token cannnot be updated since it has already being expired '});
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
    
};

// export the module 
module.exports = handlers;