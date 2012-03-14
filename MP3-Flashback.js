/*
 *  MP3 Flashback
 *  An elegant MP3 Flash fallback when HTML5 audio is not supported
 *
 *  Copyright 2012, Marc S. Brooks (http://mbrooks.info)
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  Dependencies:
 *    jquery.js
 *    jquery-ui.js
 *    swfobject.js
 */

(function($) {
	var buttonPause, buttonPlay, buttonStop, progressBar, duraTimer, volumeBar;

	var methods = {
		init : function(options) {

			// default option
			var settings = $.extend({
				playerId : 'player',
				tracks   : null
			}, options);

			return this.each(function() {
				var $this = $(this),
					data  = $this.data();

				if ( $.isEmptyObject(data) ) {
					buttonPause = $this.children('.button_pause');
					buttonPlay  = $this.children('.button_play');
					buttonStop  = $this.children('.button_stop');
					progressBar = $this.children('.progress_bar');
					duraTimer   = $this.children('.duration');
					volumeBar   = $this.children('.volume_bar');

					var soundFile = settings.tracks.file0;
					var audioObj = null;

					try {
						audioObj = new Audio(soundFile);
					}
					catch(err) {}

					// check support for HTML5 audio/MPEG3
					if (audioObj && audioObj.canPlayType('audio/mp3') ) {
						$(this).data({
							soundObj : audioObj,
							options  : settings
						});

						$(this).MP3Flashback('setup');
					}

					// .. fallback to Flash
					else {
						swfobject.embedSWF('MP3-Flashback.swf', settings.playerId, '0','0','9.0','', settings.tracks, 'transparent','',
							function() {
								$this.data({
									soundObj : window.document[settings.playerId],
									useFlash : true,
									options  : settings
								});

								$this.MP3Flashback('setup');
							}
						);
					}
				}
			});
		},

		destroy : function() {
			return this.each(function() {
				$(this).removeData();
			});
		},

		setup : function() {
			return this.each(function() {
				var $this = $(this),
					data = $this.data();

				buttonStop.attr('disabled','true');

				// initalize volume slider
				volumeBar.slider({
					range : 'min',
					min   : 1,
					max   : 175,
					value : 112
				});

				// enable mouse events; toggle play/pause button visibility
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

				// enable HTML5 audio events
				$(data.soundObj).bind('timeupdate', function() {
					var audioObj = data.soundObj;
					var minutes  = Math.floor(audioObj.currentTime / 60) % 60;
					var seconds  = Math.floor(audioObj.currentTime % 60);
					var duration = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
					var percent  = Math.ceil(audioObj.currentTime / audioObj.duration * 100);

					if (percent == 100) {
						buttonStop.trigger('click');
					}
					else {
						$.fn.playProgress(duration, percent);
					}
				});
			});
		}
	};

	$.fn.MP3Flashback = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1) );
		}
		else
		if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		}
		else {
			$.error('Method ' +  method + ' does not exist on jQuery.MP3Flashback');
		}
	};

	/*
	 * HTML5 audio/Flash callback functions
	 */
	$.fn.loadComplete = function() {
		return;
	};

	$.fn.loadProgress = function(percent) {
		return;
	};

	$.fn.playComplete = function() {
		progressBar.progressbar({ value : 0 });
		duraTimer.html('0:00');
		buttonStopEvent();
	};

	$.fn.playProgress = function(duration, percent) {
		progressBar.progressbar({ value : percent });
		duraTimer.html(duration);
	};

	/*
	 * Shared event functions
	 */
	function buttonPauseEvent() {
		buttonPause.hide(0);
		buttonPlay.show(0);
		buttonStop.removeAttr('disabled');
	}

	function buttonPlayEvent() {
		buttonPlay.hide(0);
		buttonPause.show(0);
		buttonStop.removeAttr('disabled');
	}

	function buttonStopEvent() {
		buttonPause.hide(0);
		buttonPlay.show(0);
		buttonStop.attr('disabled','true');
	}
})(jQuery);
