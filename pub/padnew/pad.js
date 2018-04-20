//Gamepad module
aircontroller.controllerPad = function(g){
    "use strict";
    var that = {
        'options': {
            //--- TBR ---
            'directionBtns': document.querySelectorAll(".actions")
        },
        //Init function
        'init': function() {
            that.setControlls();
            that.enterRoom();
            that.confirmConnection();
            //that.browserFullscreen();
        },
        //Run function (restarts/reinits)
        'run': function(options) {
            g.core.setOptions(options);
            g.core.run();
            that.init();
        },
        'toggleFullScreen': function() {
            var doc = window.document;
            var docEl = doc.documentElement;
            var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
            var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
            if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
                requestFullScreen.call(docEl);
            }
            else {
                cancelFullScreen.call(doc);
            }
        },
        'enterRoom': function() {
            var roomId = window.location.search.replace("?", '');
            if(roomId) {
                g.core.options.roomId = roomId;
            }
        },
        //Sends connection confirmation string to the Host (remote host)
        'confirmConnection': function() {
            document.addEventListener(g.core.options.dataConnectedEvt, function(evt) {
                var out = {
                  "controller": "Mobile Controller"
                };
                g.core.dataOut(out);
            });
        },
        'setControlls': function() {
            var current_action = "";
            
            function addListenerMulti(el, s, fn, p) {
              var evts = s.split(' ');
              for (var i=0, iLen=evts.length; i<iLen; i++) {
                el.addEventListener(evts[i], fn, p || false);
              }
            }
            function hasClass(el, className) {
              if (el.classList)
                return el.classList.contains(className)
              else
                return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
            }
            function addClass(el, className) {
              if (el.classList)
                el.classList.add(className)
              else if (!hasClass(el, className)) el.className += " " + className
            }
            function removeClass(el, className) {
              if (el.classList)
                el.classList.remove(className)
              else if (hasClass(el, className)) {
                var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
                el.className=el.className.replace(reg, ' ')
              }
            }

            for (var i = 0; i < that.options.directionBtns.length; ++i) {
                var btn = that.options.directionBtns[i];
                addListenerMulti(btn, "mousedown touchstart", function(evt){
                    evt.preventDefault();
                    if(!evt.target.dataset.action) {
                        return;
                    }
                    current_action = evt.target.dataset.action;
                    that.sendData(evt.target.dataset.action, 1);
                    addClass(evt.target.parentElement, evt.target.dataset.action);
                }, true);
                addListenerMulti(btn, "touchmove", function(evt){
                    evt.preventDefault();
                    var targetElem = document.elementFromPoint(evt.touches[0].pageX, evt.touches[0].pageY);
                    if(!targetElem.dataset.action) {
                        return;
                    }
                    if(targetElem.dataset.action != current_action) {
                        //Set old action to 0
                        var out = {};
                        out[current_action] = 0;
                        g.core.dataOut(out);
                        //Set new action to 1
                        that.sendData(targetElem.dataset.action, 1);
                        removeClass(evt.target.parentElement, current_action);
                        addClass(evt.target.parentElement, targetElem.dataset.action);
                        //Set new current action
                        current_action = targetElem.dataset.action;
                    }
                }, true);
                addListenerMulti(btn, "mouseup touchend", function(evt){
                    evt.preventDefault();
                    if(!evt.target.dataset.action) {
                        return;
                    }
                    setTimeout(function() {
                        if(evt.target.dataset.action != current_action) {
                            that.sendData(current_action, 0);
                            removeClass(evt.target.parentElement, current_action);
                        }
                        else {
                            that.sendData(evt.target.dataset.action, 0);
                            removeClass(evt.target.parentElement, evt.target.dataset.action);
                        }
                    }, 0);
                }, true);
            }
            //Prevent pinch to zoom on iOS 10
            document.addEventListener('gesturestart', function (e) {
                e.preventDefault();
            });
        },
        'sendData': function(action, value) {
            var out = {};
            out[action] = value;
            g.core.dataOut(out);
        }
    };
    return that;
}(aircontroller);

//https://github.com/sebleedelisle/JSTouchController
//http://www.gamepadjs.com/
//https://developer.mozilla.org/en-US/docs/Web/API/Gamepad
