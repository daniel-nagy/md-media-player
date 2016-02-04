angular.module('md.media.player').factory('$audio', function () {
  'use strict';
  
  var self = this;
  
  var audio;
  
  self.buffered = function () {
    if(self.isSet() && audio.buffered.length) {
      return Math.floor(audio.buffered.end(audio.buffered.length - 1));
    } else {
      return 0;
    }
  };
  
  self.currentTime = function () {
    return self.isSet() ? Math.floor(audio.currentTime) : 0;
  };
  
  self.duration = function () {
    if(self.isSet() && !isNaN(audio.duration)) {
      return Math.floor(audio.duration);
    } else {
      return 0;
    }
  };
  
  self.isPlaying = function () {
    return self.isSet() ? !audio.paused : false;
  };
  
  self.isRepeatEnabled = function () {
    return audio ? audio.hasAttribute('loop') : false;
  };
  
  self.isSet = function () {
    return !!audio;
  };
  
  self.off = function (target, callback) {
    if(self.isSet()) {
      if(angular.isArray(target)) {
        target.forEach(function(event) {
          audio.removeEventListener(event, callback);
        });
      } else {
        audio.removeEventListener(target, callback);
      }
    }
  };
  
  self.on = function (target, callback) {
    if(self.isSet()) {
      if(angular.isArray(target)) {
        target.forEach(function(event) {
          audio.addEventListener(event, callback);
        });
      } else {
        audio.addEventListener(target, callback);
      }
    }
  };
  
  self.play = function () {
    if(self.isSet()) {
      audio.play();
    }
  };
  
  self.pause = function () {
    if(self.isSet()) {
      audio.pause();
    }
  };
  
  self.repeatOff = function () {
    if(audio) {
      audio.removeAttribute('loop');
    }
  };
  
  self.repeatOn = function () {
    if(audio) {
      audio.setAttribute('loop', '');
    }
  };
  
  self.set = function (uri) {
    if(audio) {
      audio.src = uri;
      audio.load();
    } else {
      audio = new Audio(uri);
    }
  };
  
  self.setCurrentTime = function (time) {
    if(audio) {
      audio.currentTime = time;
    }
  };

  return self;
});