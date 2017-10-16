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
              dataInEvt: 'controllerdatain',                      //Signup for this event to receive the data
              msgTimeout: 4000,                                   //User-end messages auto-hide timeout
              transport: 'websocket',
              dataout: {
                  timer: null,
                  data: null
              },
              dataoutDelay: 40,                                   //Delay in (ms) before the system checks a button pressed
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
              var event = new CustomEvent(that.options.dataInEvt, {
                  detail: data
              });
              document.dispatchEvent(event);
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
      //Start browser detection onload event
      if (window.addEventListener) {
          window.addEventListener("load", that.init, false);
      }
      else if (window.attachEvent) {
          window.attachEvent("onload", that.init);   
      }
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
              g.core.popMsg("Ws Disconnected!");
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