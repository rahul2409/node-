/*
* Create and export configuration variables 
* 
*/
// Create a container for all the environments 
var environments = {};

// Create a default staging environment 
environments.staging ={
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging',
    'hashingSecret' :'thisIsASecret'
};

// create a production environment 
environments.production ={
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'production',
    'hashingSecret' : 'thisIsAlsoASecret'
};

// Determine which environment was passed as a command-Line argument 
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment is in one of the environments specified, if not then go to the default environment 
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging ;

// Export the module 
module.exports = environmentToExport ;

// console.log(environmentToExport);