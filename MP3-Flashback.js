/**
 *  MP3 Flashback
 *  An elegant MP3 Flash fallback when HTML5 audio is not supported.
 *
 *  Copyright 2012-2015, Marc S. Brooks (https://mbrooks.info)
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  Dependencies:
 *    jquery.js
 *    jquery-ui.js
 *    swfobject.js
 */

if (!window.jQuery || (window.jQuery && parseInt(window.jQuery.fn.jquery.replace('.', '')) < parseInt('1.8.3'.replace('.', '')))) {
  throw new Error('MP3-Flashback requires jQuery 1.8.3 or greater.');
}

(function($) {
  var soundPlayer, buttonPause, buttonPlay, buttonStop, progressBar, duraTimer, volumeBar;

  /**
   * @namespace MP3Flashback
   */
  var methods = {

    /**
     * Create new instance of MP3-Flashback
     *
     * @memberof MP3Flashback
     * @method init
     *
     * @example
     * $('#container').MP3Flashback(options);
     *
     * @param {Object} options
     *
     * @returns {Object} jQuery object
     */
    "init": function(options) {

      // Default options
      var settings = $.extend({
        volumeStart: 70,
        tracks:      null
      }, options);

      return this.each(function() {
        var $this = $(this),
            data  = $this.data();

        if ( $.isEmptyObject(data) ) {
          soundPlayer = $this;
          buttonPause = $this.children('.button_pause');
          buttonPlay  = $this.children('.button_play');
          buttonStop  = $this.children('.button_stop');
          progressBar = $this.children('.progress_bar');
          duraTimer   = $this.children('.duration');
          volumeBar   = $this.children('.volume_bar');

          var soundFile = settings.tracks.file0,
              audioObj  = null;

          try {
            $.fn.loadProgress();

            audioObj = new Audio(soundFile);
          }
          catch(err) {}

          // Check support for HTML5 audio/mpeg3
          if (audioObj && audioObj.canPlayType('audio/mp3')) {
            $.fn.loadComplete();

            $this.data({
              soundObj: audioObj,
              options:  settings
            });

            $this.MP3Flashback('_createPlayer');
          }

          // .. fallback to Flash
          else {
            var objectId = genRandStr(10),
                flashObj = $('<object></object>').attr('id', objectId);

            $this.append(flashObj);

            swfobject.embedSWF('MP3-Flashback.swf', objectId, '0', '0', '9.0', '', settings.tracks, 'transparent', '',
              function() {
                $this.data({
                  soundObj: window.document[objectId],
                  useFlash: true,
                  options:  settings
                });

                $this.MP3Flashback('_createPlayer');
              }
            );
          }
        }
      });
    },

    /**
     * Perform cleanup
     *
     * @memberof MP3Flashback
     * @method destroy
     *
     * @example
     * $('#container').MP3Flashback('destroy');
     */
    "destroy": function() {
      return this.each(function() {
        $(this).removeData();
      });
    },

    /**
     * Create audio player elements.
     *
     * @memberof MP3Flashback
     * @method _createPlayer
     * @private
     *
     * @returns {Object} jQuery object
     */
    "_createPlayer": function() {
      return this.each(function() {
        var $this = $(this),
             data = $this.data();

        buttonStop.prop('disabled', true);

        // Initalize volume slider
        volumeBar.slider({
          range: 'min',
          min:   1,
          max:   100,
          value: data.options.volumeStart,
          slide: function(event, ui) {
            var soundVol = parseFloat(ui.value / 100);

            if (data.useFlash) {
              data.soundObj.player('volume', soundVol);
            }
            else {
              data.soundObj.volume = soundVol;
            }
          }
        });

        // Enable mouse events; toggle play/pause button visibility.
        buttonPause.click(function() {
          if (data.useFlash) {
            data.soundObj.player('pause');
          }
          else {
            data.soundObj.pause();
          }

          buttonPauseEvent();
        });

        buttonPlay.click(function() {
          if (data.useFlash) {
            data.soundObj.player('play');
          }
          else {
            data.soundObj.play();
          }

          buttonPlayEvent();
        });

        buttonStop.click(function() {
          if (data.useFlash) {
            data.soundObj.player('stop');
          }
          else {
            data.soundObj.pause();
            data.soundObj.currentTime = 0;
          }

          buttonStopEvent();
        });

        // Enable HTML5 audio events.
        $(data.soundObj).bind('timeupdate', function() {
          var audioObj = data.soundObj,
              minutes  = Math.floor(audioObj.currentTime / 60) % 60,
              seconds  = Math.floor(audioObj.currentTime % 60),
              duration = minutes + ':' + (seconds < 10 ? '0' : '') + seconds,
              percent  = Math.ceil(audioObj.currentTime / audioObj.duration * 100);

          if (percent == 100) {
            buttonStop.trigger('click');
          }
          else {
            $.fn.playProgress(duration, percent);
          }
        });

        $(data.soundObj).bind('canplay', function() {
          $.fn.loadComplete();
        });
      });
    }
  };

  $.fn.MP3Flashback = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    else
    if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    }
    else {
      $.error('Method ' +  method + ' does not exist on jQuery.MP3Flashback');
    }
  };

  /**
   * HTML5 audio/Flash callback functions.
   */
  $.fn.loadComplete = function() {
    soundPlayer.removeClass('loading');
    soundPlayer.children('.button_play, .button_stop, div, span').fadeIn('slow');
  };

  $.fn.loadProgress = function() {
    soundPlayer.addClass('loading');
    soundPlayer.children('button, div, span').hide(0);
  };

  $.fn.playComplete = function() {
    progressBar.progressbar({ value: 0 });
    duraTimer.html('0:00');
    buttonStopEvent();
  };

  $.fn.playProgress = function(duration, percent) {
    progressBar.progressbar({ value: percent });
    duraTimer.html(duration);
  };

  /**
   * Shared event functions
   */
  function buttonPauseEvent() {
    buttonPause.hide(0);
    buttonPlay.show(0);
    buttonStop.removeAttr('disabled');

    progressBar.children('.ui-progressbar-value')
      .switchClass('play', 'stop');
  }

  function buttonPlayEvent() {
    buttonPlay.hide(0);
    buttonPause.show(0);
    buttonStop.removeAttr('disabled');

    progressBar.children('.ui-progressbar-value')
      .switchClass('stop', 'play');
  }

  function buttonStopEvent() {
    buttonPause.hide(0);
    buttonPlay.show(0);
    buttonStop.prop('disabled', true);

    progressBar.children('.ui-progressbar-value')
      .removeClass('stop');
  }

  /**
   * Generate a pseudo-random string.
   *
   * @protected
   *
   * @param {Number} len
   *
   * @returns {String}
   */
  function genRandStr(len) {
    var count = (len) ? len : 8,
        chars = 'abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXTZ0123456789'.split(''),
        str   = '';

    for (var i = 0; i < count; i++) {
      str += chars[ Math.floor(Math.random() * chars.length) ];
    }
    return str;
  }
})(jQuery);
