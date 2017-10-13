var controllerCore = (function(){
    var self = { 
        'options': {
            messages: document.querySelectorAll(".messages")[0],
            websocket: null,
            wsUri: 'ws://tsserver2.openode.io',
            connObj: null,                               //Connection Object (Group Id/User Id)
            meta: {
                connected: false,
                closesignal: false
            },
        },
        //General function to run browser detections
        'detectFeatures': function() {
            if (!window.WebSocket) return false;
            if (!window.JSON) return false;
            return true;
        },
        //Init function
        'init': function() {
            if(!self.detectFeatures()) return self.popMsg("Sorry, your device is not supported!");
            self.createWebSocket();
        },
        //Notifications
        'popMsg': function(message, autohide) {
            autohide = typeof autohide !== 'undefined' ? autohide : 4000;
            var el = document.createElement('div');
            el.innerHTML = message;
            el.className = 'msg';
            function removeEvt(event) {
                if(!el) return;
                el.removeEventListener('click', removeEvt);
                self.options.messages.removeChild(el);
                el = null;
            }
            el.addEventListener('click', removeEvt);
            self.options.messages.appendChild(el);
            if(autohide) setTimeout(function(){
                removeEvt();
            }, autohide);
        },
        //Websocket functions (Transport)
        'createWebSocket': function() { 
            self.options.websocket = new WebSocket(self.options.wsUri); 
            self.options.websocket.onopen = function(evt) { 
                self.wsOpen(evt) 
            }; 
            self.options.websocket.onclose = function(evt) { 
                self.wsClose(evt) 
            }; 
            self.options.websocket.onmessage = function(evt) { 
                self.wsMsgIn(evt) 
            }; 
            self.options.websocket.onerror = function(evt) { 
                self.wsError(evt) 
            }; 
        },
        'closeWebSocket': function() {
            self.options.meta.closesignal = true;
            self.options.websocket.close();
        },
        'wsOpen': function(evt) { 
            self.popMsg("Ws Connected!", 5000);
        }, 
        'wsClose': function(evt) { 
            self.popMsg("Ws Disconnected!", 5000);
            self.options.connObj = null;
            self.options.websocket = null;
            self.options.meta.connected = false;
            if(!self.options.meta.closesignal) self.createWebSocket();
        },
        'wsMsgIn': function(evt) { 
            var indata = JSON.parse(evt.data);
            if(!self.options.connObj) {
                self.options.connObj = indata;
                if(window.location.hash) {
                    self.options.connObj.id = window.location.hash.substring(1);
                }
            }
            if(!self.options.connObj || !self.options.meta.connected) {
                var out = JSON.stringify(self.options.connObj);
                self.wsMsgOut(out);
                self.options.meta.connected = true;
            }
            else self.dataIn(indata.msg);
        },
        'wsError': function(evt) { 
            self.popMsg("Ws Error: " + evt.data);
        },
        'wsMsgOut': function(message) { 
            self.options.websocket.send(message); 
        },
        //Data Processing Functions
        'dataIn': function(data) {
            self.popMsg(JSON.stringify(data));
        },
        'dataOut': function(message) {
            var out = JSON.stringify({'msg':message});
            self.wsMsgOut(out);
        }
    }
    //Start browser detection onload event
    if (window.addEventListener) {
        window.addEventListener("load", self.init, false);
    }
    else if (window.attachEvent) {
        window.attachEvent("onload", self.init);   
    }
    window.onbeforeunload = function() {
        self.closeWebSocket();
    }
    return self;
})();

var controllerPad = (function(){
    var self = {
        'options': {
            'directionBtns': document.querySelectorAll(".gamecontroller .gpad button")
        },
        //Init function
        'init': function() {
            self.setControlls();
        },
        'setControlls': function() {
            function addListenerMulti(el, s, fn, p) {
              var evts = s.split(' ');
              for (var i=0, iLen=evts.length; i<iLen; i++) {
                el.addEventListener(evts[i], fn, p || false);
              }
            }
            for (var i = 0; i < self.options.directionBtns.length; ++i) {
                var btn = self.options.directionBtns[i];
                addListenerMulti(btn, "mousedown touchstart", function(evt){
                    evt.preventDefault();
                    self.sendData(evt, 1);
                }, true);
                addListenerMulti(btn, "mouseup touchend", function(evt){
                    evt.preventDefault();
                    self.sendData(evt, 0);
                }, true);
            }
        },
        'sendData': function(evt, value) {
            var out = {};
            out[evt.target.dataset.action] = value;
            controllerCore.dataOut(out);
        }
    };
    //Start browser detection onload event
    if (window.addEventListener) {
        window.addEventListener("load", self.init, false);
    }
    else if (window.attachEvent) {
        window.attachEvent("onload", self.init);   
    }
    return self;
})();