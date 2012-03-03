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
				objectId : 'object',
				tracks   : null
			}, options);

			return this.each(function() {
				var $this = $(this),
					data  = $this.data();

				if ( $.isEmptyObject(data) ) {

					// create Flash object
					swfobject.embedSWF('MP3-Flashback.swf', settings.objectId,'1','1','9.0','', settings.tracks,'#FFFFFF');

					$(this).data({
						container : $('#' + settings.playerId),
						flash     : window.document[settings.objectId],
						options   : settings
					});

					// enable mouse events
					$(this).data.container.children('.play').click(function() {
						$(this).data.flash.player('play');
					});

					$(this).data.container.children('.stop').click(function() {
						$(this).data.flash.player('stop');
					});
				}
			});
		},

		destroy : function() {
			return this.each(function() {
				$(this).removeData();
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

		$('#timer').html(duration);
	};

	$.fn.playComplete = function() {
		return;
	};
})(jQuery);
