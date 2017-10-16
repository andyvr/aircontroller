//Transport WS module
gamecontroller.websocket = function(g){
    "use strict";
    //Websocket functions (Transport)
    var that = {
        'options': {
            websocket: null,
            wsUri: 'ws://ts-andyx.rhcloud.com:8000',     //Websocket url
            connObj: null,                               //Connection Object (Group Id/User Id)
            meta: {
                connected: false,
                closesignal: false
            }
        },
        'connectionStart': function() { 
            that.options.websocket = new WebSocket(that.options.wsUri); 
            that.options.websocket.onopen = function(evt) { 
                that.wsOpen(evt) 
            }; 
            that.options.websocket.onclose = function(evt) { 
                that.wsClose(evt) 
            }; 
            that.options.websocket.onmessage = function(evt) { 
                that.wsMsgIn(evt) 
            }; 
            that.options.websocket.onerror = function(evt) { 
                that.wsError(evt) 
            }; 
        },
        'connectionEnd': function() {
            if(that.options.websocket) {
                that.options.meta.closesignal = true;
                that.options.websocket.close();
            }
        },
        'wsOpen': function(evt) { 
            g.core.popMsg("Ws Connected!");
        }, 
        'wsClose': function(evt) { 
            g.core.popMsg("Ws, Disconnected!");
            that.options.connObj = null;
            that.options.websocket = null;
            that.options.meta.connected = false;
            if(!that.options.meta.closesignal) {
                that.connectionStart();
            }
        },
        'wsMsgIn': function(evt) { 
            var indata = JSON.parse(evt.data);
            if(!that.options.connObj) {
                that.options.connObj = indata;
                if(window.location.hash) {
                    that.options.connObj.id = window.location.hash.substring(1);
                }
            }
            if(!that.options.connObj || !that.options.meta.connected) {
                var out = JSON.stringify(that.options.connObj);
                that.wsMsgOut(out);
                that.options.meta.connected = true;
            }
            else that.dataIn(indata);
        },
        'wsError': function(evt) { 
            g.core.popMsg("Error, Websocket Connection!");
        },
        'wsMsgOut': function(message) { 
            if(that.options.websocket) {
                that.options.websocket.send(message); 
            }
        },
        //Data Processing Functions
        'dataIn': function(data) {
            if(data.msg) {
                g.core.dataIn(data.msg);
            }
        },
        'dataOut': function(data) {
            that.wsMsgOut(data);
        }
    }
    return that;
}(gamecontroller);