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

			// default options
			var settings = $.extend({
				playerId : 'player',
				tracks   : null
			}, options);

			return this.each(function() {
				var $this = $(this),
					data  = $this.data();

				if ( $.isEmptyObject(data) ) {

					// create Flash object
					swfobject.embedSWF('MP3-Flashback.swf', settings.playerId,'1','1','9.0','', settings.tracks,'#FFFFFF');

					$(this).data({
						container : $(this),
						flash     : window.document[settings.playerId],
						options   : settings
					});

					$(this).MP3Flashback('setup');
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
					data.flash.player('pause');
					$(this).hide(0);
					buttonPlay.show(0);
				});

				buttonPlay.click(function() {
					data.flash.player('play');
					$(this).hide(0);
					buttonPause.show(0);
				});

				buttonStop.click(function() {
					data.flash.player('stop');
					buttonPause.hide(0);
					buttonPlay.show(0);
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
			value : Math.round(percent * 100)
		});

		$('.progress_timer').html(duration);
	};
})(jQuery);
