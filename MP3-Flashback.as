/**
 *  MP3 Flashbock
 *  An elegant MP3 Flash fallback when HTML5 audio is not supported.
 *
 *  Copyright 2012-2015, Marc S. Brooks (https://mbrooks.info)
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
import flash.media.SoundTransform;

// Enable external callbacks
ExternalInterface.addCallback('player', soundPlayer);

// Import flashVars
var param:Object = LoaderInfo(this.root.loaderInfo).parameters;

// Register globals
var isLoading:Boolean = false;
var isPlaying:Boolean = false;
var startTime:Number  = 0.0;
var soundFile:Sound;
var soundChan:SoundChannel;
var soundTran:SoundTransform;

/**
 * Initialize sound object
 */
(function init() {
	soundFile = new Sound();
	soundChan = new SoundChannel();
	soundTran = new SoundTransform();

	// .. Bind events
	soundFile.load(new URLRequest(param.file0));
	soundFile.addEventListener(Event.COMPLETE, loadComplete);
	soundFile.addEventListener(ProgressEvent.PROGRESS, loadProgress);
	soundFile.addEventListener(IOErrorEvent.IO_ERROR, onIOError);
})();

/**
 * Callbacks when loading files; return progress as a percent.
 */
function loadProgress(e:Event) {
	if (soundFile && soundFile.length > 0) {
		var percent:Number = Math.ceil(((soundFile.bytesLoaded / soundFile.bytesTotal) * 100));
		ExternalInterface.call('$.fn.loadProgress', percent);
		isLoading = true;
	}
}

function loadComplete(e:Event) {
	if (soundFile && soundFile.length > 0) {
		soundFile.removeEventListener(Event.COMPLETE, loadComplete);
		soundFile.removeEventListener(ProgressEvent.PROGRESS, loadProgress);
		ExternalInterface.call('$.fn.loadComplete');
		isLoading = false;
	}
}

/**
 * Callbacks when playing MP3s; returns duration and percent as function arguments.
 */
function playProgress(e:Event) {
	if (!isLoading) {
		var minutes:uint    = Math.floor(soundChan.position / 1000  / 60);
		var seconds:uint    = Math.floor(soundChan.position / 1000) % 60;
		var duration:String = minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
		var loaded:Number   = soundFile.bytesLoaded  / soundFile.bytesTotal;
		var percent:Number  = Math.ceil(((soundChan.position / soundFile.length * loaded) * 100));

		if (percent == 100) {
			isPlaying = false;
			playComplete();
		}
		else {
			ExternalInterface.call('$.fn.playProgress', duration, percent);
			isPlaying = true;
		}
	}
}

function playComplete() {
	ExternalInterface.call('$.fn.playComplete');
}

/**
 * MP3 player controls: Play, Pause, Stop, and Volume events.
 */
function soundPlayer(action, volValue=null):void {
	if (isLoading) { return }

	switch(action) {
		case 'play' :
			if (isPlaying) { return }
			isPlaying = true;
			soundChan = soundFile.play(startTime);
			addEventListener(Event.ENTER_FRAME, playProgress);
		break;

		case 'pause' :
			if (!isPlaying) {
				soundPlayer('play');
			}
			else {
				isPlaying = false;
				startTime = soundChan.position;
				soundChan.stop();
				removeEventListener(Event.ENTER_FRAME, playProgress);
			}
		break;

		case 'stop' :
			isPlaying = false;
			startTime = 0.0;
			soundChan.stop();
			removeEventListener(Event.ENTER_FRAME, playProgress);
			playComplete();
		break;

		case 'volume' :
			if (!volValue) { return }
			soundTran.volume = volValue;
			soundChan.soundTransform = soundTran;
		break;
	}
}

/**
 * Handle errors.
 */
function onIOError(Event:IOErrorEvent) {
	trace('Failed to load MP3 file: ' + Event.text);
}
