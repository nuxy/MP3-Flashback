/*
 *  MP3 Flashbock
 *  An elegant MP3 Flash fallback when HTML5 audio is not supported
 *
 *  Copyright 2012, Marc S. Brooks (http://mbrooks.info)
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  Dependencies:
 *    Flash AS3
 */

import flash.events.Event;
import flash.events.ProgressEvent;
import flash.media.Sound;
import flash.media.SoundChannel;

// enable external callbacks
ExternalInterface.addCallback('player', soundPlayer);

// import flashVars
var param:Object = LoaderInfo(this.root.loaderInfo).parameters;

// register globals
var isLoaded:Boolean  = false;
var isPlaying:Boolean = false;
var startTime:Number  = 0.0;
var soundChannel:SoundChannel;
var soundFile:Sound;

/*
 * Initialize sound object
 */
(function init() {
	soundFile = new Sound();
	soundFile.load(new URLRequest(param.file0));
	soundFile.addEventListener(Event.COMPLETE, loadComplete);
	soundFile.addEventListener(ProgressEvent.PROGRESS, loadProgress);
	soundFile.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
})();

/*
 * Callbacks when loading files; return progress as a percent
 */
function loadProgress(e:Event) {
	if (soundFile && soundFile.length > 0) {
		var percent:Number = Math.floor((((soundFile.bytesLoaded * 100) / soundFile.bytesTotal) * 100));
		ExternalInterface.call('$.fn.loadProgress', percent);
		isLoaded = false;
	}
}

function loadComplete(e:Event) {
	if (soundFile && soundFile.length > 0) {
		soundFile.removeEventListener(Event.COMPLETE, loadComplete);
		ExternalInterface.call('$.fn.loadComplete');
		isLoaded = true;
	}
}

/*
 * Callbacks when playing MP3s; returns duration and percent as function arguments
 */
function playProgress(e:Event) {
	if (isLoaded) {
		var minutes:uint    = Math.floor(soundChannel.position / 1000  / 60);
		var seconds:uint    = Math.floor(soundChannel.position / 1000) % 60;
		var duration:String = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
		var loaded:Number   = soundFile.bytesLoaded  / soundFile.bytesTotal;
		var percent:Number  = Math.floor(((soundChannel.position / soundFile.length * loaded) * 100));
		ExternalInterface.call('$.fn.playProgress', duration, percent);
		isPlaying = true;
	}
}

function playComplete(e:Event) {
	if (isPlaying) {
		ExternalInterface.call('$.fn.playComplete');
		isPlaying = false;
	}
}

/*
 * MP3 player controls: Play, Pause, and Stop
 */
function soundPlayer(action):void {
	if (!isLoaded) { return }

	switch(action) {
		case 'play' :
			if (isPlaying) { return }
			isPlaying = true;
			soundChannel = soundFile.play(startTime);
			addEventListener(Event.ENTER_FRAME, playProgress);
		break;

		case 'pause' :
			if (!isPlaying) {
				soundPlayer('play');
			}
			else {
				isPlaying = false;
				startTime = soundChannel.position;
				soundChannel.stop();
				removeEventListener(Event.ENTER_FRAME, playProgress);
			}
		break;

		case 'stop' :
			if (!isPlaying) { return }
			isPlaying = false;
			startTime = 0.0;
			soundChannel.stop();
			removeEventListener(Event.ENTER_FRAME, playProgress);
			ExternalInterface.call('$.fn.playComplete');
		break;
	}
}

/*
 * Other functions
 */
function onIOError(Event:IOErrorEvent) {
	trace('Failed to load MP3 file: ' + Event.text);
}
