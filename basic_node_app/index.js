// dependencies 
var mathLib = require ('./lib/math');
var jokesLib = require('./lib/jokes');

// app object 
var app ={};

//configuration 
app.config ={
    'timebetweenjokes':1000
};

app.printajoke= function (){
    // get all the jokes 
    var alljokes = jokesLib.getalljokes();

    // calculate the number of jokes 
    var numberofjokes =alljokes.length;

    // pick a random number between 1 and the number of jokes 
    var random_number = mathLib.get_random_number(1,numberofjokes);
    
    // select the jokes from the all jokes array 
    var selected_joke = alljokes[random_number-1];

    // send the joke to the console 
    console.log(selected_joke);
};

app.infinite_loop= function(){
    // create interval using the timebetweenjokes in config 
    setInterval(app.printajoke, app.config.timebetweenjokes);
}; 

app.infinite_loop();
