//Gamepad module
aircontroller.host = function(g){
    "use strict";
    var that = {
        'options': {
            'controllerLink': 'http://aircontroller.loc.192.168.1.4.xip.io/pub/padnew/i.html',   //URL to the controller
            'welcomeScreen': true,     // display welcome screen before game starts
            'device': 'cursor',        // 'keyboard', 'cursor'
            'binding': {}              // custom bindings
        },
        //Init function
        'init': function() {
            var emiter = that.setKeyBinding();
            that.bindDataListener(emiter);
            if(that.options.welcomeScreen) {
                that.shoWelcomeScreen();
            }
        },
        //Run function (restarts/reinits)
        'run': function(options) {
            g.core.setOptions(options);
            g.core.run();
            that.init();
        },
        //Set keyboard binding - custom keys binding and possible gamepad binding
        //This creates bindings between data sent from controller and values to be broadcasted in host/game
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
                    emitter = that.keyboard;  //Sets the keys processing function (that.keyboard is a function)
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
        //Listens to the Controller Data In event
        'bindDataListener': function(func) {
            document.addEventListener(g.core.options.dataInEvt, function(evt) {
                func(evt.detail);
            });
        },
        'getScantag': function(link) {
            //Alternate service: https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example
            return '<img alt="Scan Me to load your aircontroller" src="https://chart.googleapis.com/chart?chs=300x300&chld=M|0&cht=qr&chl='+link+'"/>'
        },
        'shoWelcomeScreen': function() {
            document.addEventListener(g.core.options.dataConnectedEvt, function(evt) {
                var link = that.options.controllerLink + "?" + g.core.options.roomId;
                var tag = that.getScantag(link);
                var content = '<div class="aircontroller_welcome"><div><h6>Use your cell phone/touch device to play the game. Turn it to a simple controller!</h6><p>Please navigate to following link: <em>'+link+'</em><br>Or scan the QR code below.</p>'+tag+'</div></div>';
                document.body.insertAdjacentHTML('afterbegin', content);
                that.removeWelcomeScreen();
            });
        },
        'removeWelcomeScreen': function() {
            document.addEventListener(g.core.options.dataControllerEvt, function(evt) {
                var controllerstring = evt.detail.msg.controller;
                var welcome = document.querySelectorAll(".aircontroller_welcome");
                if(welcome.length) {
                    welcome[0].parentNode.removeChild(welcome[0]);
                }
            });
        },
        //This is called from bindDataListener and emits keypress events to the host
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
    return that;
}(aircontroller);

//https://github.com/sebleedelisle/JSTouchController
//http://www.gamepadjs.com/
//https://developer.mozilla.org/en-US/docs/Web/API/Gamepad
