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
				embedId  : 'embed',
				tracks   : null
			}, options);

			return this.each(function() {
				var $this = $(this),
					data  = $this.data();

				if ( $.isEmptyObject(data) ) {

					// create Flash object
					swfobject.embedSWF('MP3-Flashback.swf', settings.embedId,'1','1','9.0','', settings.tracks,'#FFFFFF');

					$(this).data({
						container : $('#' + settings.playerId),
						flash     : window.document[settings.embedId],
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
					data  = $this.data();

				var playing = null;

				// enable mouse events
				data.container.children('button.play').click(function() {
					data.flash.player('play');
				});

				//data.container.children('button.pause').click(function() {
				//	data.flash.player('pause');
				//});

				data.container.children('button.stop').click(function() {
					data.flash.player('stop');
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

	$.fn.loadProgress = function(percent) {
		return;
	};

	$.fn.loadComplete = function() {
		return;
	};

	$.fn.playProgress = function(duration, percent) {
		$('#progressbar').progressbar({
			value : Math.round(percent * 100)
		});

		$('#duration').html(duration);
	};

	$.fn.playComplete = function() {
		return;
	};
})(jQuery);
