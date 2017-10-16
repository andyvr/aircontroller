var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
    mc = require("mac-control");

server.listen(3000);

io.set( 'log level', 1 );
io.set( 'close timeout', 30 );

app.use(express.static(__dirname + "/public"));

app.get('/',function(req,res){
    res.sendFile('index.html');
});

var playerCount = 0;
var players = {};

var currentState = {
    "up":false,
    "down":false,
    "left":false,
    "right":false,
    "a":false,
    "b":false,
    "start":false,
    "select":false
};

var newState = {};

var threshold = .1;

io.sockets.on('connection', function(socket){
        
    playerCount++;
    
    console.log('connect ' + socket.id.substring(0,3) + " " + playerCount);
    
    players[socket.id] = {
        keys:{
            "up":false,
            "down":false,
            "left":false,
            "right":false,
            "a":false,
            "b":false,
            "start":false,
            "select":false
        }
    };

    socket.on('keys', function(data){
        
        players[socket.id].keys = data;
        updateKeys();
    });

    socket.on('disconnect', function(){
        delete players[socket.id];
        playerCount--;
        console.log('disconnect ' + socket.id.substring(0,3) + " " +playerCount);
    });

});


function updateKeys(){
    // set counts to 0
    var upCount = 0;
    var downCount = 0;
    var leftCount = 0;
    var rightCount = 0;
    var aCount = 0;
    var bCount = 0;
    var startCount = 0;
    var selectCount = 0;
        
    // then count each player pressing a button
    for ( var id in players) {
            
        var player = players[id];
            
        if(player.keys.up) upCount++;
        if(player.keys.down) downCount++;
        if(player.keys.left) leftCount++;
        if(player.keys.right) rightCount++;
        if(player.keys.a) aCount++;
        if(player.keys.b) bCount++;
        if(player.keys.start) startCount++;
        if(player.keys.select) selectCount++;
                	
    }
    
    newState = {};
        
    newState.up = (upCount / playerCount) >= threshold ? true : false;
    newState.down = (downCount / playerCount) >= threshold ? true : false;
    newState.left = (leftCount / playerCount) >= threshold ? true : false;
    newState.right =(rightCount / playerCount) >= threshold ? true : false;
    newState.a = (aCount / playerCount) >= threshold ? true : false;
    newState.b = (bCount / playerCount) >= threshold ? true : false;
    newState.start = (startCount / playerCount) >= threshold ? true : false;
    newState.select = (selectCount / playerCount) >= threshold ? true : false;
    
    checkKeys();
    
    // create object ready for sending to clients
    var democracy = {
        	"playerCount": playerCount,
        	"percentage":{
                "up":Math.round((upCount / playerCount)*100),
                "down":Math.round((downCount / playerCount)*100),
                "left":Math.round((leftCount / playerCount)*100),
                "right":Math.round((rightCount / playerCount)*100),
                "a":Math.round((aCount / playerCount)*100),
                "b":Math.round((bCount / playerCount)*100),
                "start":Math.round((startCount / playerCount)*100),
                "select":Math.round((selectCount / playerCount)*100)
            }
        }
        
    // then send the object
    io.sockets.emit('democracy', democracy);
    
    console.log(democracy);
        
}

function checkKeys(){
    
    //console.log(playerCount + currentState.a + "->" + newState.a);
    
    if(newState.up != currentState.up){
        if(newState.up){
         mc.keyHold("up");
        } else {
         mc.keyRelease("up");
        }
    }
    
    if(newState.down != currentState.down){
        if(newState.down){
         mc.keyHold("down");
        } else {
         mc.keyRelease("down");
        }
    }
    
    if(newState.left != currentState.left){
        if(newState.left){
         mc.keyHold("left");
        } else {
         mc.keyRelease("left");
        }
    }
    
    if(newState.right != currentState.right){
        if(newState.right){
         mc.keyHold("right");
        } else {
         mc.keyRelease("right");
        }
    }
    
    if(newState.a != currentState.a){
        if(newState.a){
         mc.keyHold("x");
        } else {
         mc.keyRelease("x");
        }
    }
    
    if(newState.b != currentState.b){
        if(newState.b){
         mc.keyHold("z");
        } else {
         mc.keyRelease("z");
        }
    }
    
    if(newState.start != currentState.start){
        if(newState.start){
         mc.keyHold("enter");
        } else {
         mc.keyRelease("enter");
        }
    }
    
    if(newState.select != currentState.select){
        if(newState.select){
         mc.keyHold("shift");
        } else {
         mc.keyRelease("shift");
        }
    }

    currentState= newState;
    
}
