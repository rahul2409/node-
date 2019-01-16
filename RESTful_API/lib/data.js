/*
* Library for storing and editing the data 
*
* function(){};
*/

// Dependencies
var fs = require('fs');
var path = require('path');

// Container for the module [to be exported]
var lib ={};

// base directory for the data folder 
lib.baseDir = path.join(__dirname ,'/../.data/');

// Write data to a file 
lib.create = function(dir,file,data,callback){
    // Try to open the file for writing
    console.log(lib.baseDir);
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err,fileDescriptor){
        if (!err && fileDescriptor ){
            // Convert data to a string 
            var stringData = JSON.stringify(data);
            
            // Write the data to the file and close it 
            fs.writeFile(fileDescriptor,stringData,function(err){
                if (!err){
                    fs.close(fileDescriptor,function(err){
                        if(!err){
                            callback(false);
                        }else {
                            callback('error closing file');
                        }
                    });
                }else {
                    callback('error writing to the file');
                }
            });
        }else{
            callback('Could not create new file, it may already exists');
        }
    });
};

// Read the contents of the file 
lib.read = function(dir,file,callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf-8',function(err,data){
        callback(err,data); 
    });
};

// Update the file 
lib.update = function(dir,file,data,callback){
    // open the file to be updated 
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            // Convert data to string 
            var stringData= JSON.stringify(data);

            // truncate the existing string 
            fs.truncate(fileDescriptor,function(err){
                if(!err){
                    // Write to the file and close it 
                    fs.writeFile(fileDescriptor,stringData,function(err){
                        if(!err){
                            fs.close(fileDescriptor,function(err){
                                if(!err){
                                    callback(false);
                                } else {
                                    callback('Error closing the file ');
                                }
                            });
                        } else {
                            callback('Error writing to existing file');
                        }
                    });
                }
                else {
                    callback('Error truncating the file');
                }
            });
        }else {
            callback('Could not open the file for updating, it may not exist here.');
        }
    });
};




// Exporting the module 
module.exports = lib;