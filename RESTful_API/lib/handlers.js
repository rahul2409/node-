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
handlers._users.delete = function(data,callback){
    
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

// export the module 
module.exports = handlers;