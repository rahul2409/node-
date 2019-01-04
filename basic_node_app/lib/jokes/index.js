// dependencies 
var fs = require('fs');

// app object 
jokes ={};

// create an array and store all the jokes 
jokes.getalljokes= function (){
    // read the jokes.txt file contents and select the jokes 
    var file_contents = fs.readFileSync(__dirname+'/jokes.txt','utf-8');

    // turn the string into an array 
    var arrayofjokes = file_contents.split(/\r?\n/);

    // return the array created 
    return arrayofjokes;
};

// export the library 
module.exports= jokes;
