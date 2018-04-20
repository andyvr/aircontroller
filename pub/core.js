(function () {
  'use strict';

  //Aircontroller variable
  var aircontroller = {};
  //Core module
  aircontroller.core = function(g) {
      //that is available to public
      var that = {
          'options': {
              messages: document.querySelectorAll(".messages")[0],
              translate: 'ru',
              dataInEvt: 'aircontroller_datain',                  //Signup for this event to receive the data updates
              dataConnectedEvt: 'aircontroller_connected',             //Signup for this event to receive the connected state
              dataControllerEvt: 'aircontroller_controller',      //Controller connected event
              msgTimeout: 4000,                                   //User-end messages auto-hide timeout
              transport: 'websocket',
              roomId: null,
              dataout: {
                  timer: null,
                  data: null
              },
              dataoutDelay: 20,                                   //Delay in (ms) before the system checks a button pressed
              debugToConsole: true                                //Show debug messages in the console
          },
          //Merge properties of 2 objects into the resulting object
          'mergeOptions': function(obj1, obj2) {
              var obj3 = {};
              for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
              for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
              return obj3;
          },
          //General function to run browser detections
          'detectFeatures': function() {
              if (!window.WebSocket) {
                  that.console("Websocket api not found!");
                  return false;
              }
              if (!window.JSON) {
                  that.console("Javascript JSON api not found!");
                  return false;
              }
              return true;
          },
          //Init function
          'init': function() {
              if(!that.detectFeatures()) {
                  return that.popMsg("Sorry, your device is not supported!");
              }
              that.connectionStart();
          },
          //Run function (restarts/reinits the core)
          'run': function() {
              that.connectionEnd();
              //Remove load event
              window.removeEventListener('load', that.init, false);
              //Start browser detection onload event
              window.addEventListener("load", that.init, false);
          },
          //Set custom options
          'setOptions': function(options) {

          },
          //Notifications
          'popMsg': function(message, autohide) {
              if(!that.options.messages) return;
              autohide = typeof autohide !== 'undefined' ? autohide : that.options.msgTimeout;
              var el = document.createElement('div');
              el.innerHTML = that.t(message);
              el.className = 'msg';
              function removeEvt(event) {
                  if(!el) return;
                  el.removeEventListener('click', removeEvt);
                  that.options.messages.removeChild(el);
                  el = null;
              }
              el.addEventListener('click', removeEvt);
              that.options.messages.appendChild(el);
              if(autohide) {
                  setTimeout(function(){removeEvt();}, autohide);
              }
          },
          'console': function(message) {
              if (window.console && that.options.debugToConsole) {
                  console.log(message);
              }
          },
          'broadcast': function(event, data) {  //Broadcast an event
              var e = new CustomEvent(event, {
                  detail: data
              });
              document.dispatchEvent(e);
              that.console("Event: '"+event+"' has been dispatched!");
          },
          't': function(message) {
              if (!g.i18.hasOwnProperty(that.options.translate)) {
                  return message;
              }
              else if (typeof g.i18[that.options.translate][message] === 'undefined') {
                  return message;
              }
              else {
                  return g.i18[that.options.translate][message];
              }
          },
          //General transport functions
          'connectionStart': function() {
              g[that.options.transport].connectionStart();
          },
          'connectionEnd': function() {
              g[that.options.transport].connectionEnd();
          },
          'dataIn': function(data) {
              that.popMsg(JSON.stringify(data));   //TBR
              that.console(data);
              that.broadcast(that.options.dataInEvt, data); //DataIn event
          },
          'dataOut': function(message) {
              if(message) {
                  that.options.dataout.data = that.mergeOptions(that.options.dataout.data, message);
              }
              if(!that.options.dataout.timer) {
                  that.options.dataout.timer = setTimeout(function(){
                      that.options.dataout.timer = null;
                      if(that.options.dataout.data && Object.keys(that.options.dataout.data).length) {
                          var out = JSON.stringify({'msg':that.options.dataout.data});
                          g[that.options.transport].dataOut(out);
                          that.options.dataout.data = null;
                      }
                  }, that.options.dataoutDelay);
              }
          }
      }
      //Close connection when the page is closed
      window.onbeforeunload = function() {
          that.connectionEnd();
      }
      return that;
  }(aircontroller);

  //Transport Websocket module
  aircontroller.websocket = function(g){
      //Websocket functions (Transport)
      var that = {
          'options': {
              websocket: null,                             //Websocket object
              wsUri: 'ws://tsserver2.openode.io',          //Websocket server url
              connObj: null,                               //Connection Object (Group Id/User Id)
              meta: {
                  closesignal: true
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
                  g.core.options.roomId = null;
                  that.wsClose();
              }
          },
          'wsOpen': function(evt) {
              g.core.popMsg("Ws Connected!");
          },
          'wsClose': function(evt) {
              g.core.popMsg("Ws Disconnected!");
              that.options.connObj = null;
              that.options.websocket.onclose = function () {}; // disable onclose handler first
              that.options.websocket.close();
              that.options.websocket = null;
              //Reconnect if the server have closed the connection
              if(!that.options.meta.closesignal) {
                  that.connectionStart();
              }
          },
          'wsError': function(evt) {
              g.core.popMsg("Error, Websocket Connection!");
          },
          'enterRoom': function(roomId) {
              that.options.connObj.id = roomId;
              var out = JSON.stringify(that.options.connObj);
              that.wsMsgOut(out);
          },
          'wsMsgIn': function(evt) {
              var indata = JSON.parse(evt.data);
              //Ws connection created just yet
              if(!that.options.connObj) {
                  //Set new connection ID in the WS server (handshake response)
                  that.options.connObj = indata;
                  //Set old connection ID if it's defined
                  if(g.core.options.roomId) {
                      that.enterRoom(g.core.options.roomId);
                  }
                  else {
                      g.core.options.roomId = indata.id;
                      that.enterRoom(indata.id);
                  }
                  if(that.options.meta.closesignal) {
                      //Dispatch Connected to Server event
                      g.core.broadcast(g.core.options.dataConnectedEvt, indata);
                      that.options.meta.closesignal = false;
                  }
              }
              //Dispatch Controller bind event in case a remote device is connected
              if(indata.msg.controller) {
                  g.core.broadcast(g.core.options.dataControllerEvt, indata);
              }
              //Or directly send data to server
              else that.dataIn(indata);
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
  }(aircontroller);

  //i18 translations object
  aircontroller.i18 = {
      en: {
          "Ws Connected!":"Ws Connected!"
      }
  };

  //Load module thru RequireJS / AMD Style
  if (typeof define === "function" && define.amd) {
    define("aircontroller", [], function() {
      return aircontroller;
    });
  }
  //Load module to global scope
  self.aircontroller = aircontroller;
  return aircontroller;
}());
