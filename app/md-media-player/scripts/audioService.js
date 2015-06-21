angular.module('md.media.player').factory('$audio', function () {
  'use strict';
  
  var audio;
  
  function buffered() {
    if(isSet() && audio.buffered.length) {
      return Math.floor(audio.buffered.end(audio.buffered.length - 1));
    } else {
      return 0;
    }
  }
  
  function currentTime() {
    return isSet() ? Math.floor(audio.currentTime) : 0;
  }
  
  function duration() {
    if(isSet() && !isNaN(audio.duration)) {
      return Math.floor(audio.duration);
    } else {
      return 0;
    }
  }
  
  function isPlaying() {
    return isSet() ? !audio.paused : false;
  }
  
  function isRepeatEnabled() {
    return audio ? audio.hasAttribute('loop') : false;
  }
  
  function isSet() {
    return audio ? true : false;
  }
  
  function off(target, callback) {
    if(isSet()) {
      if(angular.isArray(target)) {
        target.forEach(function(event) {
          audio.removeEventListener(event, callback);
        });
      } else {
        audio.removeEventListener(target, callback);
      }
    }
  }
  
  function on(target, callback) {
    if(isSet()) {
      if(angular.isArray(target)) {
        target.forEach(function(event) {
          audio.addEventListener(event, callback);
        });
      } else {
        audio.addEventListener(target, callback);
      }
    }
  }
  
  function play() {
    if(isSet()) {
      audio.play();
    }
  }
  
  function pause() {
    if(isSet()) {
      audio.pause();
    }
  }
  
  function repeatOff() {
    if(audio) {
      audio.removeAttribute('loop');
    }
  }
  
  function repeatOn() {
    if(audio) {
      audio.setAttribute('loop', '');
    }
  }
  
  function set(uri) {
    if(audio) {
      audio.src = uri;
      audio.load();
    } else {
      audio = new Audio(uri);
    }
  }
  
  function setCurrentTime(time) {
    if(audio) {
      audio.currentTime = time;
    }
  }

  return {
    buffered: buffered,
    currentTime: currentTime,
    duration: duration,
    isPlaying: isPlaying,
    isRepeatEnabled: isRepeatEnabled,
    isSet: isSet,
    off: off,
    on: on,
    play: play,
    pause: pause,
    repeatOff: repeatOff,
    repeatOn: repeatOn,
    set: set,
    setCurrentTime: setCurrentTime
  };
});