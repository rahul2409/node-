/*
* Primary file for running the app 
*
*
*/

// Dependencies 
var http = require('http');
// For getting the url you need the URL module of node 
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;


// The server should respond to all the request with a string
// create a server variable with a callback function taking 2 parameters res(response) and req(request) 
var server = http.createServer(function(req,res){
    // Get the URL 
    var parsedURL = url.parse(req.url,true);

    // Get the PATH
    var path = parsedURL.pathname ;
    // This path is filled with '/' and '+' signs these are removed by writing a regex 
    var trimmedPath= path.replace(/^\/+|\/+$/g,'');

    // Get the query string as an object 
    var queryStringObject = parsedURL.query;
    // var queryStringObject = parsedURL.query; This is written only due to the true passed in the parsedURL variable the true implicitly invokes the query method of node 

    // Get the HTTP methods 
    // The req object passed in the function has an attribute which gives the HTTP method used 
    var method = req.method.toLowerCase();
    //lowercase is called to make a uniform lowercase pattern 

    // Get the headers as an object 
    var headers = req.headers;

    // Get the payloads, if any
    var decoder = new StringDecoder('utf-8');
    var buffer ='';
    req.on('data',function(data){
        buffer += decoder.write(data);
    }); 

    // to end the endless stream of data we call an event known as the end event 
    req.on('end',function(){
        buffer += decoder.end();

        var chosenHandler = typeof(router[trimmedPath])!=='undefined'?router[trimmedPath]:handlers.notfound;

        // now creating the data object to be passed 
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method ,
            'headers' : headers,
            'payload' : buffer
        };

        // define the chosen handler function 
        // route the request to the handler specified in the router 
        chosenHandler(data,function(statusCode,payload){
            // use the status code provided by the object handler or the default status code as 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // use the payload provided by the callback function or the dafault paylaod as an empty string 
            payload = typeof(payload) == 'object' ? payload : {}; 

            // define the default payload data type as string 
            var payloadString = JSON.stringify(payload);
            
            // Returning the response 
            res.writeHead(statusCode);
            res.end(payloadString);
                
            // Log the request path 
            console.log('Returning this response ',statusCode,payloadString);
            
        })

    });
});

// Start the server , and have a listen on port 3000 
server.listen(3000,function(){
    console.log("server is up and running on port 3000 ");
});

// for putting manual headers used the mod headers extension of the chrome library 

// after defining the handler object, we have to modify the server in such a way that it figures out which handler to call when 
// This modification is done in req.on('end') as everything with or without a payload executes this 
// In the req.on('end') the logic is that if the trimmed path is found on router then go to handler method called by the router else go to the notfound router 

// Define handler object 
var handlers ={};

// define the handler.sample method 
handlers.sample=function(data, callback){
    // Callback an http status code and a payload object 
    callback(406,{'name' : 'sample-handler'});
};
// define the non found handler 
handlers.notfound= function(data,callback){
    // Call back the not found status code 
    callback(404);
}
// you need a router object to parse a particular URL and make api more responsve 
var router = {
    // define the handler variable 
    'sample' : handlers.sample
};