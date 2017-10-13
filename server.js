const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

// list of currently connected clients (users)
const clients = [];
// Websocket Connection Loop (Client connected)
wss.on('connection', function (ws) {
  
  console.log("New websocket connection");
  var user = {};
  ws.on('message', function (message) {
    message = JSON.parse(message);
    update_user(message, user, ws);
    send_to_peers(message, user);
  });
  ws.on("close", function () {
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