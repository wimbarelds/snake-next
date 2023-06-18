const init = function(data) {
    console.log("init", data);
};

const placeCandy = function(data) {
    console.log("candy", data);
};

let directions = ['RIGHT', 'UP', 'LEFT', 'DOWN'];
let directionIndex = 0;

function tick (data){
    console.log("tick", data);
    postMessage(directions[directionIndex]);

    directionIndex++;
    if(directionIndex >= directions.length) directionIndex = 0;
};

onmessage = function(message) {
    let obj = message.data;
    switch(obj.type) {
        case 'init':
            init(obj.data);
            break;
        case 'candy':
            placeCandy(obj.data);
            break;
        case 'tick':
            tick(obj.data);
            break;
        default:
            console.error('snake worker, unrecognized command', { message });
    }
};

console.log('Webworker AI example-bot.js ready');
