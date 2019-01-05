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

    // Send the response 
    res.end('hello World ! \n');

    // Log the request path 
    console.log('Request received on path: '+trimmedPath);

});

// Start the server , and have a listen on port 3000 
server.listen(3000,function(){
    console.log("server is up and running on port 3000 ");
});