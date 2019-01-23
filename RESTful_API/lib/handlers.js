/*
 * Request handlers 
 *
 * 
 */

// Define handler object 
var handlers ={};

// Define users 
handlers.user =function(data,callback){
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
    var firstName = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10? data.payload.phone.trim() : false ;
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