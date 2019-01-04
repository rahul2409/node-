// app object 
var math= {};

// now adding additional attributes 


math.get_random_number = function (min ,max) {
    var m=Math.ceil(Math.random() * (max-min) + min);
    return m;
};

// export the directory 
module.exports = math;