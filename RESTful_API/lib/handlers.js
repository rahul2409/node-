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
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0? data.payload.firstName.trim() : false ;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0? data.payload.lastName.trim() : false ;
    // Phone number is taken as string 
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10? data.payload.phone.trim() : false ;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length >0?data.payload.password.trim() : false;
    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ?true : false;
    // Because checking the liscense agreement is important 


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

// users= get 
handlers._users.get = function(data,callback){
    
};

// users= put 
handlers._users.put = function(data,callback){
    
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