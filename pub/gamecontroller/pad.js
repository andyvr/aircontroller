//Gamepad module
aircontroller.controllerPad = function(g){
    "use strict";
    var that = {
        'options': {
            'directionBtns': document.querySelectorAll(".gpad button")
        },
        //Init function
        'init': function() {
            that.setControlls();
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
                    setTimeout(function() {
                        that.sendData(evt, 0);
                    }, g.core.options.dataoutDelay);
                }, true);
            }
        },
        'sendData': function(evt, value) {
            var out = {};
            out[evt.target.dataset.action] = value;
            g.core.dataOut(out);
        }
    };
    that.init();
    return that;
}(aircontroller);

//https://github.com/sebleedelisle/JSTouchController
//http://www.gamepadjs.com/
//https://developer.mozilla.org/en-US/docs/Web/API/Gamepad