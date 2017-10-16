//Gamepad module
aircontroller.host = function(g){
    "use strict";
    var that = {
        'options': {
            'device': 'cursor',        // 'keyboard', 'cursor'
            'binding': {}
        },
        //Init function
        'init': function() {
            var emiter = that.setKeyBinding();
            that.bindDataListener(emiter);
        },
        'setControlls': function() {
            function addListenerMulti(el, s, fn, p) {
              var evts = s.split(' ');
              for (var i=0, iLen=evts.length; i<iLen; i++) {
                el.addEventListener(evts[i], fn, p || false);
              }
            }
            for (var i = 0; i < that.options.directionBtns.length; ++i) {
                var btn = that.options.directionBtns[i];
                addListenerMulti(btn, "mousedown touchstart", function(evt){
                    evt.preventDefault();
                    that.sendData(evt, 1);
                }, true);
                addListenerMulti(btn, "mouseup touchend", function(evt){
                    evt.preventDefault();
                    that.sendData(evt, 0);
                }, true);
            }
        },
        'setKeyBinding': function() {
            var emitter = function() {};
            switch(that.options.device) {
                case 'keyboard':
                    that.options.binding = {
                        'u': 87,
                        'd': 83,
                        'l': 65,
                        'r': 68,
                        'a': 32,
                        'b': 90,
                        's1': 49,
                        's2': 50
                    }
                    emitter = that.keyboard;
                    break;
                case 'cursor':
                    that.options.binding = {
                        'u': 38,
                        'd': 40,
                        'l': 37,
                        'r': 39,
                        'a': 32,
                        'b': 13,
                        's1': 49,
                        's2': 50
                    }
                    emitter = that.keyboard;
                    break;
            }
            return emitter;
        },
        'bindDataListener': function(func) {
            document.addEventListener(g.core.options.dataInEvt, function(evt) { 
                func(evt.detail); 
            });
        },
        'keyboard': function(data) {
            for (var prop in data) {
                if (data.hasOwnProperty(prop)) {
                    if(data[prop] == 1) {
                        var eventType = 'keydown';
                    }
                    else {
                        var eventType = 'keyup';
                    }
                    var event = document.createEvent('Event'); 
                    event.initEvent(eventType, true, true); 
                    event.keyCode = that.options.binding[prop];
                    var cancelled = !document.dispatchEvent(event);
                    /**/if(cancelled) {
                        g.core.console(eventType + " Event for " + event.keyCode + " has been canceled!");
                    }
                }
            }
        }
    };
    that.init();
    return that;
}(aircontroller);

//https://github.com/sebleedelisle/JSTouchController
//http://www.gamepadjs.com/
//https://developer.mozilla.org/en-US/docs/Web/API/Gamepad