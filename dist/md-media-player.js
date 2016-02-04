angular.module('md.media.player', ['md.media.templates']);

angular.module('md.media.player').factory('$album', ['$http', '$q', function ($http, $q) {
  'use strict';

  var albums = [];

  function Album(collection, tracks) {
    this.artist = collection.artistName;
    this.artworkUrl = collection.artworkUrl60.replace('60x60bb', '600x600');
    this.release = collection.releaseDate.split('-').shift();
    this.title = collection.collectionName;
    this.trackCount = tracks.length;
    
    this._current = 0;
    
    this.tracks = tracks.map(function (track) {
      return {
        duration: track.trackTimeMillis / 1000,
        number: track.trackNumber,
        title: track.trackName,
      };
    });
  }

  Album.prototype.currentTrack = function () {
    return this.tracks[this._current];
  };

  Album.prototype.hasNextTrack = function () {
    return this._current < this.trackCount - 1;
  };

  Album.prototype.hasPreviousTrack = function () {
    return this._current > 0;
  };

  Album.prototype.isShuffled = function () {
    var number = 0;
    
    return this.tracks.some(function (track) {
      return track.number !== ++number;
    });
  };

  Album.prototype.nextTrack = function () {
    return this.hasNextTrack() ? this.tracks[++this._current] : null;
  };

  Album.prototype.previousTrack = function () {
    return this.hasPreviousTrack() ? this.tracks[--this._current] : null;
  };

  Album.prototype.selectTrack = function (index) {
    this._current = index;
  };

  // Fisher–Yates shuffle
  Album.prototype.shuffle = function () {
    var i = this.tracks.length, j, temp;
    var current = this.tracks[this._current];
    
    while(i) {
      j = Math.floor(Math.random() * (i--));
      temp = this.tracks[i];
      
      this.tracks[i] = this.tracks[j];
      this.tracks[j] = temp;
    }
    
    this._current = this.tracks.indexOf(current);
  };

  Album.prototype.unShuffle = function () {
    this._current = this.tracks[this._current].number - 1;
    this.tracks.sort(function (a, b) {
      return a.number - b.number;
    });
  };

  return function (collectionId) {
    var defer = $q.defer();
    
    if(albums.hasOwnProperty(collectionId)) {
      defer.resolve(albums[collectionId]);
    }
    
    else {
      var itunesLookup = JSON.parse(localStorage.getItem(collectionId));
      
      if(itunesLookup) {
        albums[collectionId] = new Album(itunesLookup.results.shift(), itunesLookup.results);
        defer.resolve(albums[collectionId]);
      } else {
        $http.jsonp('https://itunes.apple.com/lookup', {
          params: {
            'callback': 'JSON_CALLBACK',
            'id': collectionId,
            'country': 'us',
            'entity': 'song'
          }
        }).success(function (data) {
          localStorage.setItem(collectionId, JSON.stringify(data));
          albums[collectionId] = new Album(data.results.shift(), data.results);
          defer.resolve(albums[collectionId]);
        });
      }
    }
    
    return defer.promise;
  };

}]);

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
    var trackList = element.find('md-tracks');
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

angular.module('md.media.templates', ['templates.list.html', 'templates.media-player.html', 'templates.pause.html', 'templates.play.html', 'templates.repeat.html', 'templates.shuffle.html', 'templates.skip-next.html', 'templates.skip-previous.html', 'templates.volume-mute.html', 'templates.volume-up.html']);

angular.module('templates.list.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates.list.html',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>');
}]);

angular.module('templates.media-player.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates.media-player.html',
    '<div layout="column">\n' +
    '  \n' +
    '  <img ng-src="{{album.artworkUrl}}"></img>\n' +
    '  \n' +
    '  <md-toolbar class="now-playing-toolbar">\n' +
    '    \n' +
    '    <md-progress-linear ng-show="audio.isSet()" class="md-accent" md-mode="buffer" value="{{getValue()}}" md-buffer-value="{{getBuffer()}}"></md-progress-linear>\n' +
    '    \n' +
    '    <div layout="row" layout-align="space-between center">\n' +
    '      <div class="md-subhead">{{album.currentTrack().title}}</div>\n' +
    '      <div class="track-duration">{{audio.currentTime() | playBack}}</div>\n' +
    '    </div>\n' +
    '    \n' +
    '    <div layout="row" layout-align="space-between">\n' +
    '      <div layout="row">\n' +
    '        <md-button class="md-icon-button" aria-label="Previous" ng-disabled="!album.hasPreviousTrack()" ng-click="selectPrevious()">\n' +
    '          <md-icon md-svg-icon="templates.skip-previous.html"></imd-icon>\n' +
    '        </md-button>\n' +
    '        <md-button class="md-icon-button" aria-label="{{audio.isPlaying() ? Pause : Play}}" ng-click="audio.isPlaying() ? audio.pause() : audio.play()">\n' +
    '          <md-icon md-svg-icon="{{audio.isPlaying() ? \'templates.pause.html\' : \'templates.play.html\'}}"></imd-icon>\n' +
    '        </md-button>\n' +
    '        <md-button class="md-icon-button" aria-label="Next" ng-disabled="!album.hasNextTrack()" ng-click="selectNext()">\n' +
    '          <md-icon md-svg-icon="templates.skip-next.html"></imd-icon>\n' +
    '        </md-button>\n' +
    '      </div>\n' +
    '      <div layout="row">\n' +
    '        <md-button class="md-icon-button" aria-label="Shuffle" ng-click="toggleShuffle()" ng-class="{active: album.isShuffled()}">\n' +
    '          <md-icon md-svg-icon="templates.shuffle.html"></imd-icon>\n' +
    '        </md-button>\n' +
    '        <md-button class="md-icon-button" aria-label="Repeat" ng-click="toggleRepeat()" ng-class="{active: audio.isRepeatEnabled()}">\n' +
    '          <md-icon md-svg-icon="templates.repeat.html"></imd-icon>\n' +
    '        </md-button>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '    \n' +
    '  </md-toolbar>\n' +
    '  \n' +
    '</div>\n' +
    '\n' +
    '<div layout="column">\n' +
    '  \n' +
    '  <md-toolbar>\n' +
    '    <div class="md-toolbar-tools" layout-align="space-between">\n' +
    '      \n' +
    '      <div layout="column">\n' +
    '        <div class="md-title">{{album.title}}</div>\n' +
    '        <div class="md-subhead">{{album.artist}} &middot; {{album.release}}</div>\n' +
    '      </div>\n' +
    '      \n' +
    '      <md-button class="md-icon-button" aria-label="Toggle Tracks" ng-click="showTracks = !showTracks">\n' +
    '        <md-icon md-svg-icon="templates.list.html"></imd-icon>\n' +
    '      </md-button>\n' +
    '      \n' +
    '    </div>\n' +
    '  </md-toolbar>\n' +
    '  \n' +
    '  \n' +
    '  <md-tracks layout="column" class="tracks" ng-show="showTracks">\n' +
    '    <div class="track-list" layout="column">\n' +
    '      <div layout="row" layout-align="start center" md-ink-ripple class="track" ng-repeat="track in album.tracks" ng-click="selectTrack(track, $index)">\n' +
    '        <div class="track-number">{{track.number | zeroPad}}</div>\n' +
    '        <div class="track-title">{{track.title}}</div>\n' +
    '        <md-icon md-svg-icon="{{audio.isPlaying() ? \'templates.volume-up.html\' : \'templates.volume-mute.html\'}}" ng-if="album._current === $index"></md-icon>\n' +
    '        <div class="track-duration">{{track.duration | playBack}}</div>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  </md-tracks>\n' +
    '  \n' +
    '</div>');
}]);

angular.module('templates.pause.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates.pause.html',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>');
}]);

angular.module('templates.play.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates.play.html',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>');
}]);

angular.module('templates.repeat.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates.repeat.html',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>');
}]);

angular.module('templates.shuffle.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates.shuffle.html',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>');
}]);

angular.module('templates.skip-next.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates.skip-next.html',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>');
}]);

angular.module('templates.skip-previous.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates.skip-previous.html',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>');
}]);

angular.module('templates.volume-mute.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates.volume-mute.html',
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M5 7v4h3l4 4V3L8 7H5z"/></svg>');
}]);

angular.module('templates.volume-up.html', []).run(['$templateCache', function($templateCache) {
  'use strict';
  $templateCache.put('templates.volume-up.html',
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M12.79 9c0-1.3-.72-2.42-1.79-3v6c1.06-.58 1.79-1.7 1.79-3zM2 7v4h3l4 4V3L5 7H2zm9-5v1.5c2.32.74 4 2.93 4 5.5s-1.68 4.76-4 5.5V16c3.15-.78 5.5-3.6 5.5-7S14.15 2.78 11 2z"/></svg>');
}]);
