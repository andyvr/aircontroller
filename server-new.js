var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port      = process.env.OPENSHIFT_NODEJS_PORT || 8000;

var WebSocketServer = require('ws').Server
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
	response.writeHead(200, {'Content-Type': 'text/plain'});
	  response.end("Thanks for visiting us! \n");
});

server.listen( port, ipaddress, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wss = new WebSocketServer({
    server: server,
    autoAcceptConnections: false
});
// list of currently connected clients (users)
var clients = [];
// Websocket Connection Loop (Client connected)
wss.on('connection', function(ws) {
  console.log("New websocket connection");
  var user = {};
  ws.on('message', function(message) {
    message = JSON.parse(message);
    update_user(message, user, ws);
    send_to_peers(message, user);
  });
  ws.on("close", function() {
    console.log("Websocket connection close");
    remove_user(user);
  });
  // Send unique connection id
  ws.send(JSON.stringify({
    'uid':  Math.random().toString().substr(2,4),
    'id':   Math.random().toString(36).substr(2,9),
    'msg':  {}
  }));
});

function update_user(message, user, ws) {
    if(!user.id && (message.id && message.uid)) {
        user.id = message.id;
        user.uid = message.uid;
        user.ws = ws;
        if(!clients[user.id]) clients[user.id] = {};
        clients[user.id][user.uid] = user;
        console.log("USER CREATED: " + user.id + " : " + user.uid);
    }
}
function remove_user(user) {
    if(!user.id) return;
    console.log("REMOVE USER: " + user.id + " : " + user.uid);
    if(clients[user.id] && clients[user.id][user.uid]) delete clients[user.id][user.uid];
    var clLength = Object.keys(clients[user.id]).length;
    if(clients[user.id] && !clLength) delete clients[user.id];
}
function send_to_peers(message, user) {
    if(!user.id) return;
    console.log("SEND FROM USER: " + user.id + " : " + user.uid + " Message: " + JSON.stringify(message.msg));
    if(clients[user.id] && clients[user.id][user.uid] && message.msg) {
        for (var key in clients[user.id]) {
            if(key != user.uid) {
                var usr = clients[user.id][key];
                usr.ws.send('{"msg":' + JSON.stringify(message.msg) + '}');
                console.log("SEND TO USER: " + usr.id + " : " + usr.uid + " Message: " + JSON.stringify(message.msg));
            }
        }
    }
}

console.log("Listening to " + ipaddress + ":" + port + "...");