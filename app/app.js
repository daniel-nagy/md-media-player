angular.module('mediaApp', ['md.media.player', 'ngMaterial'])

  .config(['$mdThemingProvider', function ($mdThemingProvider) {
    'use strict';
    
    $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('pink');
  }]);