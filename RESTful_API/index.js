/*
* Primary file for running the app 
*
*
*/

// Dependencies 
var http = require('http');

// The server should respond to all the request with a string
// create a server variable with a callback function taking 2 parameters res(response) and req(request) 
var server = http.createServer(function(req,res){
    res.end('hello World ! \n');
});

// Start the server , and have a listen on port 3000 
server.listen(3000,function(){
    console.log("server is up and running on port 3000 ");
});