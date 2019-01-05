/*
* Primary file for running the app 
*
*
*/

// Dependencies 
var http = require('http');
// For getting the url you need the URL module of node 
var url = require('url');

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

    // Send the response 
    res.end('hello World ! \n');

    // Log the request path 
    console.log('Request received with these headers: ',headers);

});

// Start the server , and have a listen on port 3000 
server.listen(3000,function(){
    console.log("server is up and running on port 3000 ");
});

// for putting manual headers used the mod headers extension of the chrome library 