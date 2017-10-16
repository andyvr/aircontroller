/* Jquery plugin for Nes Controller */

(function( $ ) {

    $.fn.nestiplayer = function( options ) {


        var settings = $.extend( {}, $.fn.nestiplayer.defaults, options );

        return this.each(function() {
            var $this = $( this );

            var socket = io.connect(window.location.hostname);
            
            socket.on('democracy',function(data){
                jQuery("#value-up").find(".inner").css('height',data.percentage.up+"%");
                jQuery("#value-down").find(".inner").css('height',data.percentage.down+"%");
                jQuery("#value-left").find(".inner").css('height',data.percentage.left+"%");
                jQuery("#value-right").find(".inner").css('height',data.percentage.right+"%");
                jQuery("#value-a").find(".inner").css('height',data.percentage.a+"%");
                jQuery("#value-b").find(".inner").css('height',data.percentage.b+"%");
                jQuery("#value-start").find(".inner").css('height',data.percentage.start+"%");
                jQuery("#value-select").find(".inner").css('height',data.percentage.select+"%");
            });

            var keys = {
                'up'     : false,
                'down'   : false,
                'left'   : false,
                'right'  : false,
                'a'      : false,
                'b'      : false,
                'start'  : false,
                'select' : false
            };
            
            var touchedElem = null;
            
            jQuery(document).on('touchmove',function(e) {
            
                var elem = document.elementFromPoint(e.originalEvent.touches[0].clientX,e.originalEvent.touches[0].clientY).id;
            
                if(touchedElem != elem){
                    touchedElem = elem;
                    console.log('1');
                } else {
                    console.log('2');
                }
                
                //console.log(elem);
                
                e.preventDefault();
            });
        

            jQuery(window).on('keydown keyup', function (e) {
                if (e.type == 'keydown') {
                    switch(e.keyCode) {
                        case 87: // W
                            if (!keys.up) {
                                pressUp();
                            }
                            break;
                        case 83: // S
                            if (!keys.down) {
                                pressDown();
                            }
                            break;
                        case 65: // A
                            if (!keys.left) {
                                pressLeft();
                            }
                            break;
                        case 68: // D
                            if (!keys.right) {
                                pressRight();
                            }
                            break;
                        case 32: // Space
                            if (!keys.a) {
                                pressA();
                            }
                            break;
                        case 80: // P
                            if (!keys.b) {
                                pressB();
                            }
                            break;
                        case 89: // Y
                            if (!keys.start) {
                                pressStart();
                            }
                            break;
                        case 84: // T
                            if (!keys.select) {
                                pressSelect();
                            }
                            break;
                    }
                } else if (e.type == 'keyup') {
                    switch(e.keyCode) {
                        case 87: // W
                            pressUp(false);
                            break;
                        case 83: // S
                            pressDown(false);
                            break;
                        case 65: // A
                            pressLeft(false);
                            break;
                        case 68: // D
                            pressRight(false);
                            break;
                        case 32: // Space
                            pressA(false);
                            break;
                        case 80: // P
                            pressB(false);
                            break;
                        case 89: // Y
                            pressStart(false);
                            break;
                        case 84: // T
                            pressSelect(false);
                            break;
                    }
                }
            });

            jQuery(settings.buttonUp).on('mousedown mouseup mouseout mouseover touchstart touchend', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.type == 'touchstart' || e.type == 'mousedown' || e.type == 'mouseover') {
                    pressUp();
                } else if (e.type == 'touchend' || e.type == 'mouseup' || e.type == 'mouseout') {
                    pressUp(false);
                }
            });
            jQuery(settings.buttonDown).on('mousedown mouseup mouseout touchstart touchend', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.type == 'touchstart' || e.type == 'mousedown') {
                    pressDown();
                } else if (e.type == 'touchend' || e.type == 'mouseup' || e.type == 'mouseout') {
                    pressDown(false);
                }
            });
            jQuery(settings.buttonLeft).on('mousedown mouseup mouseout touchstart touchend', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.type == 'touchstart' || e.type == 'mousedown') {
                    pressLeft();
                } else if (e.type == 'touchend' || e.type == 'mouseup' || e.type == 'mouseout') {
                    pressLeft(false);
                }
            });
            jQuery(settings.buttonRight).on('mousedown mouseup mouseout touchstart touchend', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.type == 'touchstart' || e.type == 'mousedown') {
                    pressRight();
                } else if (e.type == 'touchend' || e.type == 'mouseup' || e.type == 'mouseout') {
                    pressRight(false);
                }
            });
            jQuery(settings.buttonA).on('mousedown mouseup mouseout touchstart touchend', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.type == 'touchstart' || e.type == 'mousedown') {
                    pressA();
                } else if (e.type == 'touchend' || e.type == 'mouseup' || e.type == 'mouseout') {
                    pressA(false);
                }
            });
            jQuery(settings.buttonB).on('mousedown mouseup mouseout touchstart touchend', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.type == 'touchstart' || e.type == 'mousedown') {
                    pressB();
                } else if (e.type == 'touchend' || e.type == 'mouseup' || e.type == 'mouseout') {
                    pressB(false);
                }
            });
            jQuery(settings.buttonStart).on('mousedown mouseup mouseout touchstart touchend', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.type == 'touchstart' || e.type == 'mousedown') {
                    pressStart();
                } else if (e.type == 'touchend' || e.type == 'mouseup' || e.type == 'mouseout') {
                    pressStart(false);
                }
            });
            jQuery(settings.buttonSelect).on('mousedown mouseup mouseout touchstart touchend', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.type == 'touchstart' || e.type == 'mousedown') {
                    pressSelect();
                } else if (e.type == 'touchend' || e.type == 'mouseup' || e.type == 'mouseout') {
                    pressSelect(false);
                }
            });
        

            // *****************
            // Private functions
            // *****************

            // Send the keys to the server
            function sendKeyState() {
                socket.emit('keys',keys);
            }

            // All the button handling. These 8 functions could be refactored into a single function that takes a button as a parameter
            function pressUp(pressing) {
                pressing = typeof pressing !== 'undefined' ? pressing : true;
                keys.up = pressing;
                sendKeyState();
                if (pressing) {
                    jQuery(settings.buttonUp).css('fill', '#CCCCCC');
                } else {
                    jQuery(settings.buttonUp).css('fill', '#1A1A1A');
                }
            }
            function pressDown(pressing) {
                pressing = typeof pressing !== 'undefined' ? pressing : true;
                keys.down = pressing;
                sendKeyState();
                if (pressing) {
                    jQuery(settings.buttonDown).css('fill', '#CCCCCC');
                } else {
                    jQuery(settings.buttonDown).css('fill', '#1A1A1A');
                }
            }
            function pressLeft(pressing) {
                pressing = typeof pressing !== 'undefined' ? pressing : true;
                keys.left = pressing;
                sendKeyState();
                if (pressing) {
                    jQuery(settings.buttonLeft).css('fill', '#CCCCCC');
                } else {
                    jQuery(settings.buttonLeft).css('fill', '#1A1A1A');
                }
            }
            function pressRight(pressing) {
                pressing = typeof pressing !== 'undefined' ? pressing : true;
                keys.right = pressing;
                sendKeyState();
                if (pressing) {
                    jQuery(settings.buttonRight).css('fill', '#CCCCCC');
                } else {
                    jQuery(settings.buttonRight).css('fill', '#1A1A1A');
                }
            }
            function pressA(pressing) {
                pressing = typeof pressing !== 'undefined' ? pressing : true;
                keys.a = pressing;
                sendKeyState();
                if (pressing) {
                    jQuery(settings.buttonA).css('fill', '#AA0000');
                } else {
                    jQuery(settings.buttonA).css('fill', '#FF0000');
                }
            }
            function pressB(pressing) {
                pressing = typeof pressing !== 'undefined' ? pressing : true;
                keys.b = pressing;
                sendKeyState();
                if (pressing) {
                    jQuery(settings.buttonB).css('fill', '#AA0000');
                } else {
                    jQuery(settings.buttonB).css('fill', '#FF0000');
                }
            }
            function pressStart(pressing) {
                pressing = typeof pressing !== 'undefined' ? pressing : true;
                keys.start = pressing;
                sendKeyState();
                if (pressing) {
                    jQuery(settings.buttonStart).css('fill', '#CCCCCC');
                } else {
                    jQuery(settings.buttonStart).css('fill', '#1A1A1A');
                }
            }
            function pressSelect(pressing) {
                pressing = typeof pressing !== 'undefined' ? pressing : true;
                keys.select = pressing;
                sendKeyState();
                if (pressing) {
                    jQuery(settings.buttonSelect).css('fill', '#CCCCCC');
                } else {
                    jQuery(settings.buttonSelect).css('fill', '#1A1A1A');
                }
            }
        });

    };


    $.fn.nestiplayer.defaults = {
        buttonUp: '#up-button',
        buttonDown: '#down-button',
        buttonLeft: '#left-button',
        buttonRight: '#right-button',
        buttonA: '#a-button',
        buttonB: '#b-button',
        buttonStart: '#start-button',
        buttonSelect: '#select-button'
    };

}( jQuery ));