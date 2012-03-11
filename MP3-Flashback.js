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
					var soundFile = settings.tracks.file0;
					var audioObj  = new Audio(soundFile);

					// check support for HTML5 audio/ MPEG3
					if (audioObj.canPlayType('audio/mp3') ) {
						$(this).data({
							container : $(this),
							soundObj  : audioObj,
							options   : settings
						});

						$(this).MP3Flashback('setup');
					}

					// .. fallback to Flash
					else {
						swfobject.embedSWF('MP3-Flashback.swf', settings.playerId, '1','1','9.0','', settings.tracks, 'transparent','',
							function() {
								$this.data({
									container : $this,
									soundObj  : window.document[settings.playerId],
									useFlash  : true,
									options   : settings
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

				var buttonPause = data.container.children('.sound_pause');
				var buttonPlay  = data.container.children('.sound_play');
				var buttonStop  = data.container.children('.sound_stop');

				// enable mouse events; toggle play/pause button visibility
				buttonPause.click(function() {
					$(this).hide(0);

					if (data.useFlash) {
						data.soundObj.player('pause');
					}
					else {
						data.soundObj.play();
					}

					buttonPlay.show(0);
				});

				buttonPlay.click(function() {
					$(this).hide(0);

					if (data.useFlash) {
						data.soundObj.player('play');
					}
					else {
						data.soundObj.play();
					}

					buttonPause.show(0);
				});

				buttonStop.click(function() {
					if (data.useFlash) {
						data.soundObj.player('stop');
					}
					else {
						data.soundObj.pause();
						data.soundObj.currentTime = 0;
					}

					buttonPause.hide(0);
					buttonPlay.show(0);
				});

				// enable HTML5 audio events
				$(data.soundObj).bind('timeupdate progress', function() {
					var audioObj = data.soundObj;
					var minutes  = parseInt(audioObj.currentTime / 60 % 60);
					var seconds  = parseInt(audioObj.currentTime % 60);
					var duration = minutes + ':' + seconds;
					var percent  = (audioObj.currentTime / audioObj.duration * 100);

					$.fn.playProgress(duration, percent);
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

	$.fn.loadComplete = function() {
		return;
	};

	$.fn.loadProgress = function(percent) {
		return;
	};

	$.fn.playComplete = function() {
		return;
	};

	$.fn.playProgress = function(duration, percent) {
		$('.progress_bar').progressbar({
			value : percent
		});

		$('.progress_timer').html(duration);
	};
})(jQuery);
