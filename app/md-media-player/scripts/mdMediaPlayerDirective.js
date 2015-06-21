angular.module('md.media.player')
  
.controller('mdMediaPlayerController', ['$attrs', '$audio', '$element', '$scope', function controller($attrs, $audio, $element, $scope) {
  'use strict';
  
  $scope.audio = $audio;
  
  $scope.getBuffer = function () {
    return ($audio.buffered() / $audio.duration()) * 100;
  };
  
  $scope.getValue = function () {
    return ($audio.currentTime() / $audio.duration()) * 100;
  };
  
  $scope.selectTrack = function (track, index) {
    $scope.album.selectTrack(index);
    $audio.set($attrs.src.replace('${track-title}', track.title));
    $audio.play();
  };
  
  $scope.selectNext = function () {
    var playing = $audio.isPlaying();
    
    $audio.set($attrs.src.replace('${track-title}', $scope.album.nextTrack().title));
    
    if(playing) {
      $audio.play();
    }
  };
  
  $scope.selectPrevious = function () {
    var playing = $audio.isPlaying();
    
    $audio.set($attrs.src.replace('${track-title}', $scope.album.previousTrack().title));
    
    if(playing) {
      $audio.play();
    }
  };
  
  $scope.toggleRepeat = function () {
    if($audio.isRepeatEnabled()) {
      $audio.repeatOff();
    } else {
      $audio.repeatOn();
    }
  };
  
  $scope.toggleShuffle = function () {
    if($scope.album.isShuffled()) {
      $scope.album.unShuffle();
    } else {
      $scope.album.shuffle();
    }
  };
}])

.directive('mdMediaPlayer', ['$album', '$audio', function ($album, $audio) {
  'use strict';
  
  function postLink(scope, element, attrs) {
    var progress = element.find('md-progress-linear');
    var trackList = element.find('md-content');
    var toolbar = trackList.prop('previousElementSibling');
    var audioEvents = ['loadstart', 'progress', 'timeupdate'];
    
    function onEnd() {
      if(scope.album.hasNextTrack()) {
        $audio.set(attrs.src.replace('${track-title}', scope.album.nextTrack().title));
        $audio.play();
      }
    }
    
    function evalAsync() {
      scope.$evalAsync();
    }
    
    function cleanUp() {
      $audio.off('ended', onEnd);
      $audio.off(audioEvents, evalAsync);
    }
    
    $album(attrs.collectionId).then(function (album) {
      scope.album = album;
      
      attrs.$set('src', attrs.src.replace('${album-artits}', album.artist));
      attrs.$set('src', attrs.src.replace('${album-title}', album.title));
      
      if(!$audio.isSet()) {
        $audio.set(attrs.src.replace('${track-title}', album.currentTrack().title));
      }
      
      $audio.on('ended', onEnd);
      $audio.on(audioEvents, evalAsync);
      
      scope.$on('$destroy', cleanUp);
      
      progress.on(progress.hasOwnProperty('ontouchstart') ? 'touchstart' : 'mousedown', function (event) {
        $audio.setCurrentTime(event.layerX * ($audio.duration() / progress.prop('clientWidth')));
      });
    });
    
    trackList.on('scroll', function () {
      if(trackList.prop('scrollTop') <= 0) {
        toolbar.classList.remove('elevate');
      } else {
        toolbar.classList.add('elevate');
      }
    });
  }
  
  return {
    templateUrl: 'templates.media-player.html',
    controller: 'mdMediaPlayerController',
    link: postLink
  };
}])

.directive('mdTrack', ['$mdInkRipple', function ($mdInkRipple) {
  'use strict';
  
  return {
    link: function (scope, element) {
      $mdInkRipple.attach(scope, element);
    }
  };
}])

.filter('zeroPad', function () {
  'use strict';
  
  return function (input) {
    return input < 10 ? '0' + input : input;
  };
})

.filter('playBack', ['$filter', function ($filter) {
  'use strict';
  
  return function (input) {
    var minutes = Math.floor(input / 60);
    var seconds = $filter('zeroPad')(Math.floor(input % 60));
    
    return minutes + ':' + seconds;
  };
}]);